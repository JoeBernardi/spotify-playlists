import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import About from "../components/About";
import type { Playlist } from "@spotify-playlists/shared";
import { fetchPlaylists } from "../utils/api";

export const Route = createFileRoute("/about")({
  component: () => {
    const [totalTrackLength, setTotalTrackLength] = useState(0);
    const [totalTrackCount, setTotalTrackCount] = useState(0);

    useEffect(() => {
      const fetchStats = async () => {
        try {
          const playlists: Playlist[] = await fetchPlaylists();
          const allTracks = playlists.flatMap(
            (playlist) => playlist.tracks || []
          );
          setTotalTrackLength(allTracks.length);
          setTotalTrackCount(allTracks.length);
        } catch (error) {
          console.error("Failed to fetch playlist stats:", error);
        }
      };
      fetchStats();
    }, []);

    return (
      <About
        totalTrackLength={totalTrackLength}
        totalTrackCount={totalTrackCount}
      />
    );
  },
});
