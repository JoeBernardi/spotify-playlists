import { useEffect, useMemo, useState } from "react";
import { fetchAllTracks } from "./api";
import type { Track } from "@spotify-playlists/shared";
import { filterTracks } from "./search-filter";

export const useSearch = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchAllTracks()
      .then((data) => {
        if (!cancelled) setTracks(data);
      })
      .catch((err) => {
        console.error("Failed to load track search data:", err);
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTracks = useMemo(() => filterTracks(tracks, query), [tracks, query]);

  return { filteredTracks, isLoading, error, query, setQuery };
};
