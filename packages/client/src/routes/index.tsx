import { createFileRoute } from "@tanstack/react-router";
import { usePlaylists } from "../utils/hooks";
import Playlist from "../components/Playlist";

export const Route = createFileRoute("/")({
  component: () => {
    const playlists = usePlaylists();

    if (!playlists.length) {
      return null;
    }
    console.log(playlists[0].id);
    return <Playlist id={playlists[0].id} />;
  },
});
