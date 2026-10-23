import { FastifyInstance } from "fastify";
import { fetchAllTracks, fetchListing, fetchPlaylistTracks, fetchStats, SpotifyUpstreamError } from "./helpers.js";

/** JSON that reflects live Spotify data; avoid browser/proxy caching stale listings. */
const API_NO_STORE = "private, no-store";

function sendError(reply: any, e: unknown, message: string) {
  if (e instanceof SpotifyUpstreamError) {
    const status = statusForSpotifyError(e.status);
    if (e.retryAfterSeconds != null) reply.header("Retry-After", e.retryAfterSeconds);
    return reply.status(status).send({ message, code: "SPOTIFY_UNAVAILABLE" });
  }
  return reply.status(500).send({ message });
}

export function statusForSpotifyError(status: number): number {
  if (status === 429 || status === 401 || status === 403) return 503;
  if (status === 400) return 502;
  if (status >= 500) return 502;
  return status;
}

export const registerApiRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/tracks", async (_req, reply) => {
    try {
      const tracks = await fetchAllTracks();
      return reply.header("Cache-Control", "private, max-age=300").send(tracks);
    } catch (e) {
      fastify.log.error({ err: e }, "Failed to fetch all tracks");
      return sendError(reply, e, "Failed to fetch tracks");
    }
  });

  fastify.get("/playlists/stats", async (_req, reply) => {
    try {
      const stats = await fetchStats();
      return reply.header("Cache-Control", API_NO_STORE).send(stats);
    } catch (e) {
      fastify.log.error({ err: e }, "Failed to fetch stats");
      return sendError(reply, e, "Failed to fetch stats");
    }
  });

  fastify.get("/playlists", async (_req, reply) => {
    try {
      const playlists = await fetchListing();
      return reply.header("Cache-Control", API_NO_STORE).send(playlists);
    } catch (e) {
      fastify.log.error({ err: e }, "Failed to fetch playlists");
      return sendError(reply, e, "Failed to fetch playlists");
    }
  });

  fastify.get<{ Params: { id: string } }>(
    "/playlists/:id/tracks",
    async (req, reply) => {
      try {
        const playlists = await fetchListing();
        if (!playlists.some((playlist) => playlist.id === req.params.id)) {
          return reply.status(404).send({ message: "Playlist not found" });
        }
        const tracks = await fetchPlaylistTracks(req.params.id);
        fastify.log.info(
          `Sending ${tracks.length} tracks for playlist ${req.params.id}`,
        );
        return reply.header("Cache-Control", API_NO_STORE).send(tracks);
      } catch (e) {
        fastify.log.error(
          { err: e },
          `Failed to fetch tracks for playlist ${req.params.id}`,
        );
        return sendError(reply, e, "Failed to fetch tracks");
      }
    },
  );
};
