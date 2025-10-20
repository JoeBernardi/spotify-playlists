import { createFileRoute } from "@tanstack/react-router";
import PlaylistTracks from "../components/PlaylistTracks";
import { useTracks } from "../utils/hooks";

export const Route = createFileRoute("/everything")({
  component: () => {
    const tracks = useTracks();
    return <PlaylistTracks tracks={tracks} showDates={true} />;
  },
});
