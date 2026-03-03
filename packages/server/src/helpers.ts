import dotenv from "dotenv";
import NodeCache from "node-cache";

import {
  millisecondsToReadableTime,
  Playlist,
  Track,
} from "@spotify-playlists/shared";

import { cacheTTLInSeconds, MONTH_TO_NUMBER, months } from "./consts";
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
const tracksCacheKey = (id: string) => `tracks-${id}`;

const MAX_RETRIES = 3;
const INITIAL_RETRY_MS = 2_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let listingInProgress: Promise<Playlist[]> | null = null;
const trackFetchesInProgress = new Map<string, Promise<Track[]>>();

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
    const { name, duration_ms, id, album, external_urls, preview_url } = track;

    return {
      url: external_urls.spotify,
      image: album.images[1]?.url ?? album.images[0]?.url,
      artist: album.artists.map((a) => ({
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
      preview_url,
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
): Promise<Track[]> {
  const key = tracksCacheKey(playlistId);
  const cached = playlistCache.get<Track[]>(key);
  if (cached) {
    console.log(`Using cached tracks for ${playlistId}`);
    return cached;
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
      const tracks = normalizeTracks({
        tracksFromApi: getTrackItems(playlist),
        playlistDate: playlistNameToAbbreviatedDate(playlist.name),
        playlistUrl: playlist.external_urls.spotify,
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
      return tracks;
    } finally {
      trackFetchesInProgress.delete(playlistId);
    }
  })();

  trackFetchesInProgress.set(playlistId, promise);
  return promise;
}

export default {
  fetchListing,
  fetchPlaylistTracks,
  getEnv,
  playlistCache,
};
