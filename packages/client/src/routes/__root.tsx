import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Nav from "../components/Nav";
import MobileFooter from "../components/MobileFooter";
import { useFetchPlaylists } from "../utils/hooks";
import Loader from "../components/Loader";
import { useAtomValue } from "jotai";
import { errorAtom, isLoadingAtom } from "../utils/store";

export const Route = createRootRoute({
  component: () => {
    useFetchPlaylists();
    const isLoading = useAtomValue(isLoadingAtom);
    const error = useAtomValue(errorAtom);
    return (
      <div className="wrapper">
        <Nav />
        <div className="content">
          {isLoading && <Loader />}
          {!isLoading && !error && <Outlet />}
          {!isLoading && error && (
            <div style={{ padding: 16 }}>
              <p>Failed to load playlists.</p>
              <pre>{error}</pre>
            </div>
          )}
        </div>
        <MobileFooter />
        <TanStackRouterDevtools />
      </div>
    );
  },
});
