import { describe, expect, test } from "bun:test";
import { getTrackItems, normalizeTracks, SpotifyUpstreamError } from "./helpers";
import { statusForSpotifyError } from "./api";

const validTrack = {
  id: "track-1",
  name: "Song",
  type: "track",
  duration_ms: 61_000,
  external_urls: { spotify: "https://open.spotify.com/track/track-1" },
  artists: [{ name: "Artist", external_urls: { spotify: "https://open.spotify.com/artist/artist-1" } }],
  album: {
    name: "Album",
    images: [{ url: "https://image/cover" }],
    external_urls: { spotify: "https://open.spotify.com/album/album-1" },
  },
};

describe("Spotify response normalization", () => {
  test("supports the current items.item response and rejects null/non-track items", () => {
    const playlist = {
      items: { items: [{ item: validTrack }, { item: null }, { item: { ...validTrack, type: "episode" } }] },
    } as Parameters<typeof getTrackItems>[0];

    expect(getTrackItems(playlist)).toEqual([validTrack]);
  });

  test("drops malformed tracks instead of failing the entire playlist", () => {
    const tracks = normalizeTracks({
      tracksFromApi: [validTrack, { ...validTrack, id: null }],
      playlistDate: "8/26",
      playlistUrl: "https://open.spotify.com/playlist/playlist-1",
    });

    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toMatchObject({ id: "track-1", title: "Song", date: "8/26" });
  });
});

describe("Spotify error mapping", () => {
  test.each([[400, 502], [401, 503], [403, 503], [429, 503], [500, 502], [503, 502], [404, 404]])(
    "%i maps to %i",
    (upstream, downstream) => expect(statusForSpotifyError(upstream)).toBe(downstream),
  );

  test("retains Retry-After metadata", () => {
    expect(new SpotifyUpstreamError("limited", 429, 12).retryAfterSeconds).toBe(12);
  });
});
