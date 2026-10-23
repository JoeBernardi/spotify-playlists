import { useSearch } from "../utils/search";
import PlaylistTracks from "./PlaylistTracks";

export const Search = () => {
  const { query, setQuery, filteredTracks, isLoading, error } = useSearch();
  const hasQuery = query.trim().length > 0;
  return (
    <section className="search">
      <div className="search-input-wrap">
        <input
          className="search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by song or artist"
          aria-label="Search by song or artist"
        />
      </div>

      {isLoading && <p className="search-status">Loading song history…</p>}
      {error && <p className="search-status">Couldn’t load song history.</p>}
      {!isLoading && !error && hasQuery && (
        <p className="search-status">
          {filteredTracks.length
            ? `${filteredTracks.length} ${filteredTracks.length === 1 ? "song" : "songs"} found`
            : "No songs found"}
        </p>
      )}
      {!!filteredTracks.length && (
        <PlaylistTracks tracks={filteredTracks} showDates={true} />
      )}
    </section>
  );
};
