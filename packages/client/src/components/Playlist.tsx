import { useNavigate } from "@tanstack/react-router";

import LinkIcon from "../assets/img/icons/link.svg?react";
import NextIcon from "../assets/img/icons/next.svg?react";
import PrevIcon from "../assets/img/icons/prev.svg?react";

import PlaylistTracks from "./PlaylistTracks";
import { usePlaylist, usePlaylists } from "../utils/hooks";
import { useMemo } from "react";
import { useAtom } from "jotai";
import { activeTrackIdAtom } from "../utils/store";

const Playlist = ({ id }: { id?: string }) => {
  const navigate = useNavigate();
  const allPlaylists = usePlaylists();
  const playlist = usePlaylist(id);
  const [activeTrackId, setActiveTrack] = useAtom(activeTrackIdAtom);

  const sortedPlaylistIds = useMemo(() => {
    return allPlaylists.map((playlist) => playlist.id);
  }, [allPlaylists]);

  const activePlaylistIndex = useMemo(() => {
    return sortedPlaylistIds.indexOf(playlist?.id ?? "");
  }, [sortedPlaylistIds, playlist]);

  const previousPlaylist = () => {
    const previousPlaylistId = sortedPlaylistIds[activePlaylistIndex + 1];
    navigate({ to: `/playlist/${previousPlaylistId}` });
  };

  const nextPlaylist = () => {
    const nextPlaylistId = sortedPlaylistIds[activePlaylistIndex - 1];
    navigate({ to: `/playlist/${nextPlaylistId}` });
  };

  if (!playlist) {
    return null;
  }

  const prevButtonDisabled =
    activePlaylistIndex + 1 === sortedPlaylistIds.length;
  const nextButtonDisabled = activePlaylistIndex === 0;

  return (
    <section className="playlist">
      <div className="playlist-info">
        {playlist.image && (
          <div className="playlist-info-image">
            <img src={playlist.image} alt={playlist.title} />
          </div>
        )}
        <div className="playlist-info-text">
          <div className="playlist-info-text-header">
            <h2 className="playlist-info-text-header-title">
              {playlist.title}
            </h2>
            <div className="playlist-info-text-header-nav-wrapper">
              <button
                className="playlist-info-text-header-nav-button prev"
                disabled={prevButtonDisabled}
                onClick={() => previousPlaylist()}
              >
                <PrevIcon />
              </button>
              <a
                href={playlist.url}
                target="_blank"
                className="playlist-info-text-header-link-icon"
              >
                <LinkIcon />
              </a>
              <button
                className="playlist-info-text-header-nav-button next"
                disabled={nextButtonDisabled}
                onClick={() => nextPlaylist()}
              >
                <NextIcon />
              </button>
            </div>
          </div>
          {playlist.description && (
            <p
              className="playlist-info-text-description"
              dangerouslySetInnerHTML={{ __html: playlist.description }}
            />
          )}
        </div>
      </div>
      <PlaylistTracks
        tracks={playlist.tracks}
        activeTrackId={activeTrackId}
        setActiveTrack={setActiveTrack}
      />
    </section>
  );
};

export default Playlist;
