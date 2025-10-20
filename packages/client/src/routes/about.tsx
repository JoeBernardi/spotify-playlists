import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import About from "../components/About";
import type { Playlist } from "@spotify-playlists/shared";
import { fetchPlaylists } from "../utils/api";

export const Route = createFileRoute("/about")({
  loader: async () => {
    const playlists: Playlist[] = await fetchPlaylists();
    const allTracks = playlists.flatMap((playlist) => playlist.tracks || []);
    return {
      totalTrackLength: allTracks.length,
      totalTrackCount: allTracks.length,
    };
  },
  component: () => {
    const { totalTrackLength, totalTrackCount } = useLoaderData({
      from: "/about",
    });

    return (
      <About
        totalTrackLength={totalTrackLength}
        totalTrackCount={totalTrackCount}
      />
    );
  },
});
