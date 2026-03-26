import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePlaylists } from "./hooks";

/** Replace current route with the newest playlist (listing order), or "/" if none. */
export function useReplaceWithNewestPlaylist(enabled: boolean) {
  const playlists = usePlaylists();
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;
    if (playlists.length > 0) {
      navigate({
        to: "/playlist/$id",
        params: { id: playlists[0].id },
        replace: true,
      });
    } else {
      navigate({ to: "/", replace: true });
    }
  }, [enabled, playlists, navigate]);
}
