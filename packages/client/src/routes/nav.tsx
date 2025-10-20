import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
const NavComponent = lazy(() => import("../components/Nav"));

export const Route = createFileRoute("/nav")({
  component: NavComponent,
});
