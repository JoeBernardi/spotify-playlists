import { useSearch } from "../utils/search";
import PlaylistTracks from "./PlaylistTracks";

export const Search = () => {
  const { query, setQuery, filteredTracks } = useSearch();
  return (
    <section className="search">
      <div className="search-input-wrap">
        <input
          className="search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tracks, artists, albums"
          aria-label="Search tracks, artists, albums"
        />
      </div>

      {!!filteredTracks.length && (
        <PlaylistTracks tracks={filteredTracks} showDates={true} />
      )}
    </section>
  );
};
