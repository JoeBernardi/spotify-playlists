import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import PlaylistTracks from "../components/PlaylistTracks";
import { fetchPlaylists } from "../utils/api";

export const Route = createFileRoute("/everything")({
  loader: async () => {
    const data = await fetchPlaylists();
    const tracks = data.flatMap((playlist) => playlist.tracks || []);
    return {
      tracks,
    };
  },
  component: () => {
    const { tracks } = useLoaderData({ from: "/everything" });
    return <PlaylistTracks tracks={tracks} />;
  },
});
