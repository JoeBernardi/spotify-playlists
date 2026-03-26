import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./assets/css/main.scss";

// Import the generated route tree
import { routeTree } from "./routeTree.gen.js";
import NotFoundRedirect from "./components/NotFoundRedirect";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundRedirect,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
