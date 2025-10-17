import { useEffect } from "react";

import type { Playlist, Track } from "@spotify-playlists/shared";
import Nav from "./components/Nav";
import MobileFooter from "./components/MobileFooter";
import Loader from "./components/Loader";

interface AppProps {
  getPlaylists: () => Promise<void>;
  setActiveTrack: (trackId: string) => void;
  activeTrackId: string;
  totalTrackLength: number;
  sortedPlaylistIds: string[];
  allTracks: Track[];
  playlistsById: Record<string, Playlist>;
  tracksById: Record<string, Track>;
  activePlaylistId?: string;
}

const App = ({
  getPlaylists,
  sortedPlaylistIds,
  playlistsById,
  activeTrackId,
  tracksById,
  setActiveTrack,
}: AppProps) => {
  useEffect(() => {
    getPlaylists();
  }, []);
  const isLoaded = !!sortedPlaylistIds.length;
  return (
    <div>
      {isLoaded && (
        <section className="wrapper">
          <Nav
            sortedPlaylistIds={sortedPlaylistIds}
            playlistsById={playlistsById}
            activeTrackId={activeTrackId}
            tracksById={tracksById}
            setActiveTrack={setActiveTrack}
          />

          <MobileFooter />
        </section>
      )}
      {!isLoaded && <Loader />}
    </div>
  );
};

export default App;
