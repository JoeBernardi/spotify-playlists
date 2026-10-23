import { describe, expect, test } from "bun:test";
import type { Track } from "@spotify-playlists/shared";
import { filterTracks } from "./search-filter";

const track = (id: string, title: string, artist: string): Track => ({
  id,
  title,
  artist: [{ name: artist, url: "https://example.com/artist" }],
  album: { name: "Album", url: "https://example.com/album" },
  length: { total_ms: 1, readable_length: "0:01" },
  image: "",
  url: "https://example.com/track",
  date: "1/26",
  playlistUrl: "https://example.com/playlist",
});

const tracks = [
  track("1", "I Want to Hold Your Hand", "The Beatles"),
  track("2", "Yesterday", "The Beatles"),
  track("3", "Hold On", "Wilson Phillips"),
];

describe("track substring search", () => {
  test("matches title and artist without case sensitivity", () => {
    expect(filterTracks(tracks, "BEATLES")).toHaveLength(2);
    expect(filterTracks(tracks, "i want to hold your hand")).toEqual([tracks[0]]);
  });

  test("requires every search term to occur", () => {
    expect(filterTracks(tracks, "beatles yesterday")).toEqual([tracks[1]]);
    expect(filterTracks(tracks, "beatles hold")).toEqual([tracks[0]]);
  });

  test("returns no results for an empty or absent substring", () => {
    expect(filterTracks(tracks, "  ")).toEqual([]);
    expect(filterTracks(tracks, "hey jude")).toEqual([]);
  });
});
