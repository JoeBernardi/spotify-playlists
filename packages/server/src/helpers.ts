import dotenv from "dotenv";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import NodeCache from "node-cache";

import {
  millisecondsToReadableTime,
  Playlist,
  Track,
} from "@spotify-playlists/shared";

import {
  cacheTTLInSeconds,
  MONTH_TO_NUMBER,
  months,
  STABLE_PLAYLIST_AGE_DAYS,
  TRACK_FETCH_DELAY_MS,
} from "./consts";
import {
  SpotifyApi,
  Playlist as SpotifyPlaylist,
  Track as SpotifyTrack,
  PlaylistedTrack,
} from "@spotify/web-api-ts-sdk";

export const getEnv = (): any => dotenv.config().parsed;

export const playlistCache = new NodeCache({
  stdTTL: cacheTTLInSeconds,
  useClones: true,
});

const LISTING_CACHE_KEY = "playlist-listing";
export const tracksCacheKey = (id: string) => `tracks-${id}`;

const MAX_RETRIES = 3;
const INITIAL_RETRY_MS = 2_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let listingInProgress: Promise<Playlist[]> | null = null;
const trackFetchesInProgress = new Map<string, Promise<Track[]>>();

/** In-memory map of stable playlist tracks, loaded from JSON on startup */
export const stablePlaylistsMap = new Map<string, Track[]>();

function getStablePlaylistsPath(): string {
  return (
    process.env.STABLE_PLAYLISTS_PATH ??
    path.join(process.cwd(), "data", "stable-playlists.json")
  );
}

export function isPlaylistStable(month: string, year: string): boolean {
  const monthIdx = months.indexOf(month);
  if (monthIdx === -1) return false;
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) return false;
  const lastDayOfMonth = new Date(yearNum, monthIdx + 1, 0);
  const ageMs = Date.now() - lastDayOfMonth.getTime();
  return ageMs > STABLE_PLAYLIST_AGE_DAYS * 24 * 60 * 60 * 1000;
}

export async function loadStablePlaylistsFromDisk(): Promise<void> {
  const filePath = getStablePlaylistsPath();
  try {
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as {
      version?: number;
      updatedAt?: string;
      playlists?: Record<string, { tracks: Track[] }>;
    };
    const playlists = data.playlists ?? {};
    stablePlaylistsMap.clear();
    for (const [id, entry] of Object.entries(playlists)) {
      if (entry?.tracks) stablePlaylistsMap.set(id, entry.tracks);
    }
    console.log(
      `Loaded ${stablePlaylistsMap.size} stable playlists from ${filePath}`,
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("No stable playlists file found, starting fresh");
    } else {
      console.warn(`Failed to load stable playlists: ${message}`);
    }
  }
}

export async function saveStablePlaylistsToDisk(): Promise<void> {
  const filePath = getStablePlaylistsPath();
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  const playlists: Record<string, { tracks: Track[] }> = {};
  for (const [id, tracks] of stablePlaylistsMap) {
    playlists[id] = { tracks };
  }
  const data = {
    version: 1,
    updatedAt: new Date().toISOString(),
    playlists,
  };
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Saved ${stablePlaylistsMap.size} stable playlists to ${filePath}`);
}

/** Drops stable playlist snapshots from memory and deletes the JSON file so track fetches hit Spotify. */
export async function clearStablePlaylistsCache(): Promise<void> {
  stablePlaylistsMap.clear();
  const filePath = getStablePlaylistsPath();
  try {
    await unlink(filePath);
    console.log(`Removed stable playlists cache: ${filePath}`);
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw e;
  }
}

getEnv();

// --- Retry helper ---

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit =
        err instanceof Error && /rate limit/i.test(err.message);
      if (!isRateLimit || attempt === MAX_RETRIES) throw err;

      const backoff = INITIAL_RETRY_MS * 2 ** attempt;
      console.warn(
        `Rate limited (${label}), retrying in ${backoff}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`,
      );
      await sleep(backoff);
    }
  }
  throw new Error("unreachable");
}

// --- Auth / API instance ---

let cachedApi: { api: SpotifyApi; expiresAt: number } | null = null;

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<string> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(
      `Token refresh failed: ${data.error_description || data.error}`,
    );
  }

  return data.access_token;
}

async function getSpotifyApi(): Promise<SpotifyApi> {
  if (cachedApi && Date.now() < cachedApi.expiresAt) {
    return cachedApi.api;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Spotify credentials: SPOTIFY_CLIENT_ID and/or SPOTIFY_SECRET",
    );
  }

  if (!refreshToken) {
    throw new Error(
      "Missing SPOTIFY_REFRESH_TOKEN — run `bun packages/server/scripts/get-refresh-token.ts` to obtain one",
    );
  }

  console.log("Refreshing access token...");
  const accessToken = await getAccessToken(
    clientId,
    clientSecret,
    refreshToken,
  );
  console.log("Access token obtained");

  const api = SpotifyApi.withAccessToken(clientId, {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: refreshToken,
  });

  cachedApi = { api, expiresAt: Date.now() + 3_500_000 };
  return api;
}

// --- Visibility filter ---

function getLastCompletedMonth(): { month: string; year: number } {
  const now = new Date();
  const monthIndex = now.getMonth(); // 0 = January
  if (monthIndex === 0) {
    return { month: "December", year: now.getFullYear() - 1 };
  }
  return { month: months[monthIndex - 1], year: now.getFullYear() };
}

function isPlaylistVisible(name: string, isPublic: boolean | null): boolean {
  if (isPublic === false) return false;

  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return false;

  const [monthName, yearStr] = parts;
  if (!months.includes(monthName)) return false;

  const year = parseInt(yearStr, 10);
  if (isNaN(year)) return true;

  const { month: lastMonth, year: lastMonthYear } = getLastCompletedMonth();
  const lastMonthIdx = months.indexOf(lastMonth);
  const playlistMonthIdx = months.indexOf(monthName);

  if (year > lastMonthYear) return false;
  if (year === lastMonthYear && playlistMonthIdx > lastMonthIdx) return false;

  return true;
}

// --- Track extraction & normalization ---

/**
 * Extracts the track list from a playlist response, handling both the
 * current (`tracks.items[].track`) and post-March-2026 (`items.items[].item`)
 * API shapes.
 */
function getTrackItems(
  playlist: SpotifyPlaylist,
): PlaylistedTrack<SpotifyTrack>[] {
  const raw = playlist as any;

  const container = raw.items ?? raw.tracks;
  if (!container?.items) return [];

  return container.items.map((entry: any) => {
    const track = entry.item ?? entry.track;
    return { ...entry, track };
  });
}

const normalizeTracks = ({
  tracksFromApi,
  playlistDate,
  playlistUrl,
}: {
  tracksFromApi: PlaylistedTrack<SpotifyTrack>[];
  playlistDate: string;
  playlistUrl: string;
}): Track[] => {
  return tracksFromApi.map(({ track }) => {
    const { name, duration_ms, id, album, external_urls, artists } = track;

    return {
      url: external_urls.spotify,
      image: album.images[1]?.url ?? album.images[0]?.url,
      artist: artists.map((a) => ({
        name: a.name,
        url: a.external_urls.spotify,
      })),
      date: playlistDate,
      length: {
        total_ms: duration_ms,
        readable_length: millisecondsToReadableTime(duration_ms),
      },
      album: { name: album.name, url: album.external_urls.spotify },
      playlistUrl,
      id,
      title: name,
    };
  });
};

const playlistNameToAbbreviatedDate = (playlistName: string) => {
  const [month, year] = playlistName.split(" ");
  return `${MONTH_TO_NUMBER[month]}/${year.slice(-2)}`;
};

// --- Public API ---

export async function fetchListing(): Promise<Playlist[]> {
  const cached = playlistCache.get<Playlist[]>(LISTING_CACHE_KEY);
  if (cached) {
    console.log("Using cached playlist listing");
    return cached;
  }

  if (listingInProgress) {
    console.log("Listing fetch in progress, waiting...");
    return listingInProgress;
  }

  console.log("Fetching playlist listing from Spotify...");
  listingInProgress = (async () => {
    try {
      const api = await getSpotifyApi();
      const allItems: any[] = [];
      let offset = 0;

      while (true) {
        const page = await withRetry(
          () => api.currentUser.playlists.playlists(50, offset),
          `listing offset=${offset}`,
        );
        if (!page.items?.length) break;
        allItems.push(...page.items);
        offset += 50;
        if (allItems.length >= page.total) break;
      }

      const filtered = allItems.filter((p) =>
        isPlaylistVisible(p.name, p.public),
      );
      const playlists: Playlist[] = (filtered.length > 0 ? filtered : allItems)
        .map((p) => ({
          description: p.description ?? undefined,
          url: p.external_urls.spotify,
          id: p.id,
          image: p.images?.[0]?.url,
          title: p.name,
          month: p.name.split(" ")[0],
          year: p.name.split(" ")[1],
          tracks: [],
        }))
        .sort((a, b) => (new Date(b.title) > new Date(a.title) ? 1 : -1));

      if (filtered.length === 0 && allItems.length > 0) {
        console.warn(
          "Visibility filter excluded all playlists; including all as fallback",
        );
      }
      console.log(
        `Fetched ${playlists.length} playlists (${allItems.length} total from API)`,
      );
      playlistCache.set(LISTING_CACHE_KEY, playlists);
      return playlists;
    } finally {
      listingInProgress = null;
    }
  })();

  return listingInProgress;
}

export async function fetchPlaylistTracks(
  playlistId: string,
  opts?: { skipStableSave?: boolean },
): Promise<Track[]> {
  const key = tracksCacheKey(playlistId);
  const cached = playlistCache.get<Track[]>(key);
  if (cached) {
    console.log(`Using cached tracks for ${playlistId}`);
    return cached;
  }

  const stableTracks = stablePlaylistsMap.get(playlistId);
  if (stableTracks) {
    console.log(`Using stable disk cache for ${playlistId}`);
    playlistCache.set(key, stableTracks);
    return stableTracks;
  }

  const existing = trackFetchesInProgress.get(playlistId);
  if (existing) {
    console.log(`Track fetch for ${playlistId} in progress, waiting...`);
    return existing;
  }

  console.log(`Fetching tracks for playlist ${playlistId}...`);
  const promise = (async () => {
    try {
      const api = await getSpotifyApi();
      const playlist = await withRetry(
        () => api.playlists.getPlaylist(playlistId),
        `playlist ${playlistId}`,
      );
      const [month, year] = playlist.name.split(" ");
      const playlistDate = playlistNameToAbbreviatedDate(playlist.name);
      const playlistUrl = playlist.external_urls.spotify;
      const tracks = normalizeTracks({
        tracksFromApi: getTrackItems(playlist),
        playlistDate,
        playlistUrl,
      });
      console.log(`Fetched ${tracks.length} tracks for ${playlistId}`);

      const setOk = playlistCache.set(key, tracks);
      if (!setOk) {
        console.warn(`Cache set failed for ${key}`);
      } else {
        const verified = playlistCache.get<Track[]>(key);
        console.log(
          `Cache verified for ${key}: ${verified?.length ?? "null"} tracks`,
        );
      }

      if (isPlaylistStable(month, year)) {
        stablePlaylistsMap.set(playlistId, tracks);
        if (!opts?.skipStableSave) {
          await saveStablePlaylistsToDisk();
        }
      }

      return tracks;
    } finally {
      trackFetchesInProgress.delete(playlistId);
    }
  })();

  trackFetchesInProgress.set(playlistId, promise);
  return promise;
}

/**
 * Hydrates the track cache in the background by sequentially fetching tracks
 * for all playlists with a delay between requests to avoid Spotify rate limits.
 * Stable playlists (older than 60 days) are served from disk when available;
 * only recent playlists and missing stable ones hit the Spotify API.
 * Does not block; runs fire-and-forget.
 */
export function hydrateTrackCache(): void {
  (async () => {
    try {
      const playlists = await fetchListing();
      console.log(
        `[hydrate] Starting background track cache hydration for ${playlists.length} playlists`,
      );
      let stableFromDisk = 0;
      let fetchedFromApi = 0;
      for (let i = 0; i < playlists.length; i++) {
        const playlist = playlists[i];
        try {
          const stableTracks = stablePlaylistsMap.get(playlist.id);
          if (
            stableTracks &&
            isPlaylistStable(playlist.month, playlist.year)
          ) {
            playlistCache.set(tracksCacheKey(playlist.id), stableTracks);
            stableFromDisk++;
          } else {
            await fetchPlaylistTracks(playlist.id);
            fetchedFromApi++;
          }
        } catch (err) {
          console.error(
            `[hydrate] Failed to fetch tracks for ${playlist.id}:`,
            err,
          );
        }
        if (i < playlists.length - 1) {
          await sleep(TRACK_FETCH_DELAY_MS);
        }
      }
      console.log(
        `[hydrate] Track cache hydration complete (${stableFromDisk} from disk, ${fetchedFromApi} from API)`,
      );
    } catch (err) {
      console.error("[hydrate] Track cache hydration failed:", err);
    }
  })();
}

/** Stats computed from disk/cached track data (stable + in-memory cache). */
export interface PlaylistStats {
  playlistCount: number;
  totalTrackCount: number;
  totalDurationMs: number;
}

export async function fetchStats(): Promise<PlaylistStats> {
  const playlists = await fetchListing();
  let totalTrackCount = 0;
  let totalDurationMs = 0;

  for (const playlist of playlists) {
    const stableTracks = stablePlaylistsMap.get(playlist.id);
    const cachedTracks = playlistCache.get<Track[]>(tracksCacheKey(playlist.id));
    const tracks = stableTracks ?? cachedTracks ?? [];

    totalTrackCount += tracks.length;
    totalDurationMs += tracks.reduce(
      (acc, t) => acc + (t.length?.total_ms ?? 0),
      0,
    );
  }

  return {
    playlistCount: playlists.length,
    totalTrackCount,
    totalDurationMs,
  };
}

export default {
  fetchListing,
  fetchPlaylistTracks,
  fetchStats,
  hydrateTrackCache,
  getEnv,
  playlistCache,
};
