import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Nav from "../components/Nav";
import MobileFooter from "../components/MobileFooter";
import { useFetchPlaylists } from "../utils/hooks";
import Loader from "../components/Loader";

export const Route = createRootRoute({
  component: () => {
    const isDevelopment = import.meta.env.DEV;
    useFetchPlaylists();

    return (
      <Suspense fallback={<Loader />}>
        <div className="wrapper">
          <Nav />
          <div className="content">
            <Outlet />
          </div>
          <MobileFooter />
          {isDevelopment && <TanStackRouterDevtools />}
        </div>
      </Suspense>
    );
  },
});
