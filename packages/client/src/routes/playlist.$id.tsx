import { createFileRoute } from "@tanstack/react-router";
import Playlist from "../components/Playlist";
import { useParams } from "@tanstack/react-router";
import { usePlaylists } from "../utils/hooks";
import { useReplaceWithNewestPlaylist } from "../utils/redirect-newest";

export const Route = createFileRoute("/playlist/$id")({
  component: () => {
    const { id } = useParams({ from: "/playlist/$id" });
    const playlists = usePlaylists();

    const isKnownInvalid =
      playlists.length > 0 && !playlists.some((p) => p.id === id);

    useReplaceWithNewestPlaylist(isKnownInvalid);

    if (isKnownInvalid) {
      return null;
    }

    return <Playlist id={id} />;
  },
});
