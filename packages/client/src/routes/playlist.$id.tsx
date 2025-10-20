import { createFileRoute } from "@tanstack/react-router";
import Playlist from "../components/Playlist";
import { useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/playlist/$id")({
  component: () => {
    const { id } = useParams({ from: "/playlist/$id" });
    return <Playlist id={id} />;
  },
});
