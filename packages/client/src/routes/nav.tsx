import { createFileRoute } from "@tanstack/react-router";
import Nav from "../components/Nav";

export const Route = createFileRoute("/nav")({
  component: () => <Nav />,
});
