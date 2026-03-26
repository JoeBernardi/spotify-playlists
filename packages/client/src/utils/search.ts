import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { useAllPlaylistTracks } from "./hooks";

export const useSearch = () => {
  const { tracks, isLoading } = useAllPlaylistTracks();
  const [query, setQuery] = useState("");
  const fuse = useMemo(
    () =>
      new Fuse(tracks, {
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
      }),
    [tracks],
  );

  const filteredTracks = useMemo(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return [];
    }

    return fuse.search(normalizedQuery).map((result) => result.item);
  }, [query, tracks, fuse]);

  return { filteredTracks, isLoading, query, setQuery };
};
