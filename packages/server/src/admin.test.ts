import { afterEach, describe, expect, test } from "bun:test";
import type { Track } from "@spotify-playlists/shared";
import Fastify from "fastify";
import { findDuplicateTracks, registerAdminRoutes } from "./admin";

const originalAdminUsername = process.env.ADMIN_USERNAME;
const originalAdminPassword = process.env.ADMIN_PASS;

afterEach(() => {
  process.env.ADMIN_USERNAME = originalAdminUsername;
  process.env.ADMIN_PASS = originalAdminPassword;
});

const track = (id: string, title: string, artist: string, date: string): Track => ({
  id,
  title,
  date,
  artist: [{ name: artist, url: "https://example.com/artist" }],
  album: { name: "Album", url: "https://example.com/album" },
  length: { total_ms: 1, readable_length: "0:01" },
  image: "",
  url: "https://example.com/track",
  playlistUrl: "https://example.com/playlist",
});

describe("admin duplicate warnings", () => {
  test("reports matching title and artist without blocking on Spotify IDs", () => {
    const warnings = findDuplicateTracks([
      track("first-id", "Déjà Vu", "Beyoncé", "1/25"),
      track("second-id", "Deja Vu", "Beyonce", "8/26"),
      track("third-id", "Deja Vu", "Olivia Rodrigo", "9/26"),
    ]);

    expect(warnings).toEqual([
      {
        title: "Déjà Vu",
        artist: "Beyoncé",
        playlists: ["1/25", "8/26"],
      },
    ]);
  });

  test("returns no warning for unique songs", () => {
    expect(
      findDuplicateTracks([
        track("one", "Song One", "Artist", "1/26"),
        track("two", "Song Two", "Artist", "2/26"),
      ]),
    ).toEqual([]);
  });
});

describe("admin page authentication", () => {
  test("rejects unauthenticated requests and serves the sync control after login", async () => {
    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASS = "secret";
    const app = Fastify();
    await registerAdminRoutes(app);

    const rejected = await app.inject({ method: "GET", url: "/admin" });
    expect(rejected.statusCode).toBe(401);

    const accepted = await app.inject({
      method: "GET",
      url: "/admin",
      headers: { authorization: `Basic ${btoa("admin:secret")}` },
    });
    expect(accepted.statusCode).toBe(200);
    expect(accepted.headers["cache-control"]).toBe("private, no-store");
    expect(accepted.body).toContain("Sync Spotify");

    await app.close();
  });
});
