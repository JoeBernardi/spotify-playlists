import { createFileRoute } from "@tanstack/react-router";
import Playlist from "../components/Playlist";
import { fetchPlaylists } from "../utils/api";
import { useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async () => {
    const playlists = await fetchPlaylists();
    return {
      playlists,
    };
  },
  component: () => {
    const { playlists } = useLoaderData({ from: "/" });

    if (!playlists.length) {
      return null;
    }
    return <Playlist id={playlists[0].id} />;
  },
});
