import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Nav from "../components/Nav";
import MobileFooter from "../components/MobileFooter";
import { useFetchPlaylists } from "../utils/hooks";

export const Route = createRootRoute({
  component: () => {
    useFetchPlaylists();
    return (
      <div className="wrapper">
        <Nav />
        <div className="content">
          <Outlet />
        </div>
        <MobileFooter />
        <TanStackRouterDevtools />
      </div>
    );
  },
});
