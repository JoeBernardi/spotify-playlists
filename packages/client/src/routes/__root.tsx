import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Nav from "../components/Nav";
import MobileFooter from "../components/MobileFooter";
import { useFetchPlaylists } from "../utils/hooks";
import Loader from "../components/Loader";
import { useAtomValue } from "jotai";
import { isLoadingAtom } from "../utils/store";

export const Route = createRootRoute({
  component: () => {
    const isDevelopment = import.meta.env.DEV;
    useFetchPlaylists();
    const isLoading = useAtomValue(isLoadingAtom);

    if (isLoading) {
      return <Loader />;
    }

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
