import { useEffect, useMemo } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { fetchPlaylists } from "./api";
import {
  setPlaylistsAtom,
  playlistsAtom,
  tracksAtom,
  isLoadingAtom,
  errorAtom,
} from "./store";
import { useParams } from "@tanstack/react-router";

export const useFetchPlaylists = () => {
  const setPlaylists = useSetAtom(setPlaylistsAtom);
  const setIsLoading = useSetAtom(isLoadingAtom);
  const setError = useSetAtom(errorAtom);
  const playlists = useAtomValue(playlistsAtom);
  useEffect(() => {
    const fetchPlaylistsData = async () => {
      // If we already have playlists in the atom, skip refetching
      if (playlists && playlists.length > 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchPlaylists();
        setPlaylists(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
        setError(error instanceof Error ? error.message : String(error));
        setIsLoading(false);
      }
    };
    fetchPlaylistsData();
  }, [setPlaylists, setIsLoading, setError, playlists]);
};

export const usePlaylists = () => {
  const playlists = useAtomValue(playlistsAtom);
  return playlists;
};

export const useTracks = () => {
  const tracks = useAtomValue(tracksAtom);
  return tracks;
};

export const usePlaylist = (id?: string) => {
  const playlists = usePlaylists();

  if (id) {
    return useMemo(
      () => playlists.find((playlist) => playlist.id === id),
      [playlists, id]
    );
  }

  // Try to get route params only if we're on the playlist route
  let routeId: string | undefined;
  try {
    const params = useParams({ from: "/playlist/$id" });
    routeId = params.id;
  } catch {
    // Not on playlist route, routeId remains undefined
  }

  return useMemo(
    () => playlists.find((playlist) => playlist.id === routeId),
    [playlists, routeId]
  );
};
