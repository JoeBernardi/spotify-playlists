import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

// Lazy load the component to avoid import issues
const PlaylistComponent = lazy(() => import("../components/Playlist"));

export const Route = createFileRoute("/playlist/$id")({
  component: PlaylistComponent,
});
