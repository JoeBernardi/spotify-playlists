import { createFileRoute } from "@tanstack/react-router";
import Playlist from "../components/Playlist";
import { usePlaylists } from "../utils/hooks";

function IndexComponent() {
    const playlists = usePlaylists();

    if (!playlists.length) {
      return null;
    }
    return <Playlist id={playlists[0].id} />;
}

export const Route = createFileRoute("/")({
  component: IndexComponent,
});
