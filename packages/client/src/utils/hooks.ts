import { useEffect, useMemo } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { fetchPlaylists } from "./api";
import { setPlaylistsAtom, playlistsAtom, tracksAtom } from "./store";
import { useParams } from "@tanstack/react-router";

export const useFetchPlaylists = () => {
  const setPlaylists = useSetAtom(setPlaylistsAtom);
  useEffect(() => {
    const fetchPlaylistsData = async () => {
      try {
        const data = await fetchPlaylists();
        setPlaylists(data);
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      }
    };
    fetchPlaylistsData();
  }, [setPlaylists]);
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
