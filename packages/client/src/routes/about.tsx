import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

// Lazy load the component to avoid import issues
const AboutComponent = lazy(() => import("../components/About"));

export const Route = createFileRoute("/about")({
  component: AboutComponent,
});
