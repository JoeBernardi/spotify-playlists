import { createFileRoute } from "@tanstack/react-router";
import PlaylistTracks from "../components/PlaylistTracks";
import Loader from "../components/Loader";
import { useAllPlaylistTracks } from "../utils/hooks";

export const Route = createFileRoute("/everything")({
  component: () => {
    const { tracks, isLoading } = useAllPlaylistTracks();
    return (
      <>
        {tracks.length > 0 && (
          <PlaylistTracks tracks={tracks} showDates={true} />
        )}
        {isLoading && <Loader />}
      </>
    );
  },
});
