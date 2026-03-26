import Fuse, { type IFuseOptions } from "fuse.js";
import type { Track } from "@spotify-playlists/shared";
import { useDeferredValue, useMemo, useState } from "react";
import { useAllPlaylistTracks } from "./hooks";

const FUSE_OPTIONS: IFuseOptions<Track> = {
  includeScore: true,
  threshold: 0.1,
  ignoreLocation: true,
  ignoreDiacritics: true,
  fieldNormWeight: 1.5,
  ignoreFieldNorm: true,
  keys: [
    { name: "title", weight: 0.2 },
    { name: "artist.name", weight: 0.5 },
    { name: "album.name", weight: 0.2 },
  ],
};

export const useSearch = () => {
  const { tracks, isLoading } = useAllPlaylistTracks();
  const deferredTracks = useDeferredValue(tracks);
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () => new Fuse(deferredTracks, FUSE_OPTIONS),
    [deferredTracks],
  );

  const filteredTracks = useMemo(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return [];
    }

    return fuse.search(normalizedQuery).map((result) => result.item);
  }, [query, fuse]);

  return { filteredTracks, isLoading, query, setQuery };
};
