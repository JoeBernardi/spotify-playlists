import { createFileRoute } from "@tanstack/react-router";
import Playlist from "../components/Playlist";
import { usePlaylists } from "../utils/hooks";

export const Route = createFileRoute("/")({
  component: () => {
    const playlists = usePlaylists();

    if (!playlists.length) {
      return null;
    }
    return <Playlist id={playlists[0].id} />;
  },
});
