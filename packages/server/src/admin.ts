import { FastifyInstance } from "fastify";
import {
  clearStablePlaylistsCache,
  fetchListing,
  fetchPlaylistTracks,
  isPlaylistStable,
  invalidatePlaylistListing,
  loadStablePlaylistsFromDisk,
  playlistCache,
  saveStablePlaylistsToDisk,
  stablePlaylistsMap,
  tracksCacheKey,
} from "./helpers.js";
import type { Track } from "@spotify-playlists/shared";
import { TRACK_FETCH_DELAY_MS } from "./consts.js";
import { timingSafeEqual } from "node:crypto";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let syncInProgress = false;

interface DuplicateWarning {
  title: string;
  artist: string;
  playlists: string[];
}

export function findDuplicateTracks(tracks: Track[]): DuplicateWarning[] {
  const groups = new Map<string, Track[]>();
  for (const track of tracks) {
    const artist = track.artist.map((item) => item.name).join(", ");
    const key = `${track.title}::${artist}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();
    groups.set(key, [...(groups.get(key) ?? []), track]);
  }

  return [...groups.values()]
    .filter((matches) => matches.length > 1)
    .map((matches) => ({
      title: matches[0].title,
      artist: matches[0].artist.map((item) => item.name).join(", "),
      playlists: matches.map((item) => item.date),
    }));
}

export async function registerAdminRoutes(fastify: FastifyInstance) {
  // Register basic auth for admin endpoints
  await fastify.register(import("@fastify/basic-auth"), {
    validate: async (username, password) => {
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASS;

      if (!adminUsername || !adminPassword) {
        throw new Error("Admin credentials not configured");
      }

      const usernameMatches = safeEqual(username, adminUsername);
      const passwordMatches = safeEqual(password, adminPassword);
      if (usernameMatches && passwordMatches) {
        return;
      } else {
        throw new Error("Invalid credentials");
      }
    },
    authenticate: { realm: "Admin" },
  });

  fastify.get(
    "/admin",
    { preHandler: fastify.basicAuth },
    async (_req, res) =>
      res
        .header("Cache-Control", "private, no-store")
        .type("text/html; charset=utf-8")
        .send(adminPage),
  );

  fastify.post<{ Body: { refreshExisting?: boolean } }>(
    "/admin/sync",
    { preHandler: fastify.basicAuth },
    async (req, res) => {
      if (syncInProgress) {
        return res.status(409).send({
          success: false,
          message: "A Spotify sync is already running.",
        });
      }

      syncInProgress = true;
      try {
        invalidatePlaylistListing();
        const playlists = await fetchListing();
        const refreshExisting = req.body?.refreshExisting === true;
        let added = 0;
        let refreshed = 0;

        for (let i = 0; i < playlists.length; i++) {
          const playlist = playlists[i];
          const exists = stablePlaylistsMap.has(playlist.id);
          if (exists && !refreshExisting) continue;

          playlistCache.del(tracksCacheKey(playlist.id));
          stablePlaylistsMap.delete(playlist.id);
          const tracks = await fetchPlaylistTracks(playlist.id, {
            skipStableSave: true,
          });
          stablePlaylistsMap.set(playlist.id, tracks);
          exists ? refreshed++ : added++;
          if (i < playlists.length - 1) await sleep(TRACK_FETCH_DELAY_MS);
        }

        await saveStablePlaylistsToDisk();
        const allTracks = playlists.flatMap(
          (playlist) => stablePlaylistsMap.get(playlist.id) ?? [],
        );
        const duplicates = findDuplicateTracks(allTracks);

        return res.send({
          success: true,
          message: "Spotify sync complete.",
          playlistCount: playlists.length,
          trackCount: allTracks.length,
          added,
          refreshed,
          duplicates,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        fastify.log.error({ err: error }, "Admin Spotify sync failed");
        await loadStablePlaylistsFromDisk();
        return res.status(500).send({
          success: false,
          message: "Spotify sync failed. The previous saved data is still intact.",
        });
      } finally {
        syncInProgress = false;
      }
    },
  );

  // Admin endpoint to bust cache
  fastify.post(
    "/admin/cache/bust",
    { preHandler: fastify.basicAuth },
    async (_req, res) => {
      try {
        playlistCache.flushAll();
        await clearStablePlaylistsCache();
        return res.send({
          success: true,
          message:
            "In-memory cache and stable disk snapshot cleared; tracks will refetch from Spotify",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: "Failed to clear cache",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Admin endpoint to refresh stable playlists from Spotify and overwrite JSON
  fastify.post(
    "/admin/cache/refresh-stable",
    { preHandler: fastify.basicAuth },
    async (_req, res) => {
      try {
        const playlists = await fetchListing();
        const stable = playlists.filter((p) =>
          isPlaylistStable(p.month, p.year),
        );
        for (const p of stable) {
          playlistCache.del(tracksCacheKey(p.id));
          stablePlaylistsMap.delete(p.id);
        }
        for (let i = 0; i < stable.length; i++) {
          await fetchPlaylistTracks(stable[i].id, { skipStableSave: true });
          if (i < stable.length - 1) await sleep(TRACK_FETCH_DELAY_MS);
        }
        await saveStablePlaylistsToDisk();
        return res.send({
          success: true,
          message: `Refreshed ${stable.length} stable playlists from Spotify`,
          count: stable.length,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: "Failed to refresh stable playlists",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Admin endpoint to check cache status
  fastify.get(
    "/admin/cache/status",
    { preHandler: fastify.basicAuth },
    async (_req, res) => {
      try {
        const stats = playlistCache.getStats();
        const keys = playlistCache.keys();
        return res.send({
          success: true,
          stats,
          keys,
          stablePlaylistsCount: stablePlaylistsMap.size,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: "Failed to get cache status",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );
}

const adminPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Playlist sync</title>
  <style>
    :root { color-scheme: dark; --ink:#f5f2ed; --muted:#819fba; --accent:#ce5374; --panel:#233344; --ground:#0d1b2a; }
    * { box-sizing: border-box; }
    body { margin:0; min-height:100vh; background:var(--ground); color:var(--ink); font-family:Poppins,system-ui,sans-serif; }
    main { width:min(620px, calc(100% - 32px)); margin:0 auto; padding:clamp(48px,10vh,96px) 0; }
    .eyebrow { margin:0 0 10px; color:var(--accent); font:700 11px/1.2 "Roboto Mono",monospace; letter-spacing:.14em; text-transform:uppercase; }
    h1 { margin:0; font-size:clamp(38px,10vw,68px); line-height:.95; letter-spacing:-.055em; }
    .intro { max-width:46ch; margin:20px 0 32px; color:var(--muted); line-height:1.6; }
    .deck { padding:22px; border:1px solid color-mix(in srgb, var(--muted) 35%, transparent); background:var(--panel); border-radius:6px; box-shadow:8px 8px 0 color-mix(in srgb, var(--accent) 28%, transparent); }
    button { width:100%; min-height:52px; border:0; border-radius:4px; background:var(--accent); color:white; font:700 15px/1 Poppins,system-ui,sans-serif; cursor:pointer; }
    button:hover { filter:brightness(1.08); }
    button:focus-visible, input:focus-visible { outline:3px solid var(--ink); outline-offset:3px; }
    button:disabled { cursor:wait; opacity:.62; }
    .rare { display:flex; gap:10px; align-items:flex-start; margin:18px 0 0; color:var(--muted); font-size:13px; line-height:1.45; }
    .rare input { margin-top:3px; accent-color:var(--accent); }
    #result { min-height:24px; margin-top:28px; }
    .summary { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; margin:0 0 22px; background:color-mix(in srgb, var(--muted) 22%, transparent); border:1px solid color-mix(in srgb, var(--muted) 22%, transparent); }
    .stat { padding:14px; background:var(--ground); }
    .stat strong { display:block; font:700 22px/1.2 "Roboto Mono",monospace; }
    .stat span { color:var(--muted); font-size:11px; }
    .message { margin:0; line-height:1.5; }
    .warnings { margin-top:22px; padding-top:20px; border-top:1px solid color-mix(in srgb, var(--muted) 30%, transparent); }
    .warnings h2 { margin:0 0 12px; color:var(--accent); font-size:14px; }
    .warnings ul { margin:0; padding-left:20px; color:var(--muted); font-size:13px; line-height:1.6; }
    .warnings strong { color:var(--ink); }
    .error { color:#ff9a9a; }
    @media (max-width:480px) { main { width:min(100% - 24px,620px); padding-top:38px; } .deck { padding:18px; box-shadow:5px 5px 0 color-mix(in srgb, var(--accent) 28%, transparent); } }
    @media (prefers-reduced-motion:no-preference) { button { transition:filter .15s ease, opacity .15s ease; } }
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">Likes Song · private</p>
    <h1>Sync the archive.</h1>
    <p class="intro">Publish your monthly playlist in Spotify, then sync it here. New songs become searchable immediately.</p>
    <section class="deck" aria-labelledby="sync-action">
      <button id="sync-action" type="button">Sync Spotify</button>
      <label class="rare"><input id="refresh-existing" type="checkbox">Also refresh every existing playlist. Use this only after editing an older playlist.</label>
      <div id="result" role="status" aria-live="polite"><p class="message">Ready when you are.</p></div>
    </section>
  </main>
  <script>
    const button = document.querySelector("#sync-action");
    const refresh = document.querySelector("#refresh-existing");
    const result = document.querySelector("#result");
    const escapeHtml = (value) => String(value).replace(/[&<>\"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#039;"})[char]);
    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "Syncing…";
      result.innerHTML = '<p class="message">Checking Spotify and updating the archive…</p>';
      try {
        const response = await fetch("/admin/sync", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({refreshExisting:refresh.checked})
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Sync failed.");
        const warnings = data.duplicates.length
          ? '<div class="warnings"><h2>Duplicate song warnings</h2><ul>' + data.duplicates.map((item) => '<li><strong>' + escapeHtml(item.title) + '</strong> · ' + escapeHtml(item.artist) + ' (' + escapeHtml(item.playlists.join(", ")) + ')</li>').join("") + '</ul></div>'
          : '<div class="warnings"><h2>No duplicate songs found.</h2></div>';
        result.innerHTML = '<div class="summary"><div class="stat"><strong>' + data.added + '</strong><span>new playlists</span></div><div class="stat"><strong>' + data.playlistCount + '</strong><span>total playlists</span></div><div class="stat"><strong>' + data.trackCount + '</strong><span>total songs</span></div></div><p class="message">Sync complete. The search archive is current.</p>' + warnings;
      } catch (error) {
        result.innerHTML = '<p class="message error">' + escapeHtml(error.message || "Sync failed.") + '</p>';
      } finally {
        button.disabled = false;
        button.textContent = "Sync Spotify";
      }
    });
  </script>
</body>
</html>`;

function safeEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}
