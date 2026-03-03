import { useEffect, useMemo, useRef, useState } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { fetchPlaylists, fetchPlaylistTracks } from "./api";
import {
  setPlaylistsAtom,
  playlistsAtom,
  tracksAtom,
  isLoadingAtom,
  loadedTrackIdsAtom,
  setPlaylistTracksAtom,
} from "./store";
import { useParams } from "@tanstack/react-router";

export const useFetchPlaylists = () => {
  const setPlaylists = useSetAtom(setPlaylistsAtom);
  const setIsLoading = useSetAtom(isLoadingAtom);
  const playlists = useAtomValue(playlistsAtom);
  useEffect(() => {
    const fetchPlaylistsData = async () => {
      if (playlists && playlists.length > 0) {
        return;
      }
      setIsLoading(true);

      try {
        const data = await fetchPlaylists();
        setPlaylists(data);
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylistsData();
  }, [setPlaylists, playlists]);
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
      [playlists, id],
    );
  }

  let routeId: string | undefined;
  try {
    const params = useParams({ from: "/playlist/$id" });
    routeId = params.id;
  } catch {
    routeId = undefined;
  }

  return useMemo(
    () => playlists.find((playlist) => playlist.id === routeId),
    [playlists, routeId],
  );
};

export const usePlaylistTracks = (id?: string) => {
  const setTracks = useSetAtom(setPlaylistTracksAtom);
  const loadedIds = useAtomValue(loadedTrackIdsAtom);
  const [isLoading, setIsLoading] = useState(false);

  const isLoaded = id ? loadedIds.has(id) : true;

  useEffect(() => {
    if (!id || isLoaded) return;

    let cancelled = false;
    setIsLoading(true);

    fetchPlaylistTracks(id)
      .then((tracks) => {
        setTracks({ id, tracks });
      })
      .catch((err) => {
        if (!cancelled) console.error(`Failed to fetch tracks for ${id}:`, err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isLoaded, setTracks]);

  return { isLoadingTracks: isLoading && !isLoaded };
};

export const useAllPlaylistTracks = () => {
  const playlists = useAtomValue(playlistsAtom);
  const setTracks = useSetAtom(setPlaylistTracksAtom);
  const loadedIds = useAtomValue(loadedTrackIdsAtom);
  const tracks = useAtomValue(tracksAtom);
  const [isLoading, setIsLoading] = useState(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (fetchingRef.current || !playlists.length) return;
    const unloaded = playlists.filter((p) => !loadedIds.has(p.id));
    if (!unloaded.length) return;

    fetchingRef.current = true;
    setIsLoading(true);

    const TRACK_FETCH_DELAY_MS = 150;
    (async () => {
      for (let i = 0; i < unloaded.length; i++) {
        const playlist = unloaded[i];
        try {
          const t = await fetchPlaylistTracks(playlist.id);
          setTracks({ id: playlist.id, tracks: t });
        } catch (err) {
          console.error(`Failed to fetch tracks for ${playlist.id}:`, err);
        }
        if (i < unloaded.length - 1) {
          await new Promise((r) => setTimeout(r, TRACK_FETCH_DELAY_MS));
        }
      }
      setIsLoading(false);
      fetchingRef.current = false;
    })();
  }, [playlists]);

  return { tracks, isLoading };
};
