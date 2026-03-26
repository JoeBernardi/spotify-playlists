import { useEffect, useState } from "react";
import { usePlaylistNav } from "../utils/playlist-nav";
import LinkIcon from "../assets/img/icons/link.svg?react";
import NextIcon from "../assets/img/icons/next.svg?react";
import PrevIcon from "../assets/img/icons/prev.svg?react";

import PlaylistTracks from "./PlaylistTracks";
import Lightbox from "./Lightbox";
import { usePlaylist, usePlaylistTracks } from "../utils/hooks";

const Playlist = ({ id }: { id?: string }) => {
  const playlistNav = usePlaylistNav(id);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [coverState, setCoverState] = useState<{
    playlistImageUrl: string;
    playlistId: string;
  } | null>(null);
  const playlist = usePlaylist(id);
  usePlaylistTracks(id);

  useEffect(() => {
    setLightboxOpen(false);
  }, [playlist?.id]);

  useEffect(() => {
    const playlistImageUrl = playlist?.image;
    const playlistId = playlist?.id;

    if (!playlistImageUrl || !playlistId) {
      setCoverState(null);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled)
        setCoverState({
          playlistImageUrl,
          playlistId,
        });
    };
    img.onerror = () => {
      if (!cancelled)
        setCoverState({
          playlistImageUrl,
          playlistId,
        });
    };
    img.src = playlistImageUrl;
    return () => {
      cancelled = true;
    };
  }, [playlist?.id, playlist?.image]);

  if (!playlist) {
    return null;
  }

  const {
    nextButtonDisabled,
    prevButtonDisabled,
    playlistNeighborIds,
    goToPlaylist,
  } = playlistNav;

  const coverReady =
    coverState != null &&
    coverState.playlistId === playlist.id &&
    coverState.playlistImageUrl === playlist.image;

  return (
    <section className="playlist">
      <div className="playlist-info">
        {playlist.image && (
          <button
            type="button"
            className="playlist-info-image"
            disabled={!coverReady}
            aria-busy={!coverReady}
            onClick={() => coverReady && setLightboxOpen(true)}
            aria-label={`View cover art for ${playlist.title}`}
          >
            {coverReady && coverState ? (
              <img
                src={coverState.playlistImageUrl}
                alt={playlist.title}
                decoding="async"
                fetchPriority="high"
              />
            ) : (
              <span
                className="playlist-info-image-placeholder"
                aria-hidden="true"
              />
            )}
          </button>
        )}
        {lightboxOpen && playlist.image && (
          <Lightbox
            src={playlist.image}
            alt={playlist.title}
            onClose={() => setLightboxOpen(false)}
          />
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
                onClick={() => goToPlaylist(playlistNeighborIds[0])}
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
                onClick={() => goToPlaylist(playlistNeighborIds[1])}
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
      <PlaylistTracks tracks={playlist.tracks ?? []} />
    </section>
  );
};

export default Playlist;
