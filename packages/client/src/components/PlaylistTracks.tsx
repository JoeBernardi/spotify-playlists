import type { Track } from "@spotify-playlists/shared";
import ClockIcon from "../assets/img/icons/clock.svg?react";
import PauseIcon from "../assets/img/icons/pause.svg?react";
import PlayIcon from "../assets/img/icons/play.svg?react";
import { useAtom } from "jotai";
import { activeTrackIdAtom } from "../utils/store";

interface PlaylistTracksProps {
  tracks: Track[];
  showDates?: boolean;
}

const PlaylistTracks = ({ tracks, showDates = false }: PlaylistTracksProps) => {
  const [activeTrackId, setActiveTrack] = useAtom(activeTrackIdAtom);
  return (
    <table className="playlist-tracks">
      <thead className="playlist-tracks-info">
        <tr>
          <th className="playlist-tracks-info-type preview" scope="col">
            &nbsp;
          </th>
          <th className="playlist-tracks-info-type title" scope="col">
            Title
          </th>
          <th className="playlist-tracks-info-type artist" scope="col">
            Artist
          </th>
          <th className="playlist-tracks-info-type album" scope="col">
            Album
          </th>
          <th className="playlist-tracks-info-type length icon" scope="col">
            <ClockIcon />
          </th>
          {showDates && (
            <th className="playlist-tracks-info-type date" scope="col">
              Playlist
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {tracks.map((track) => {
          const artists = track.artist
            .map(
              (artist) =>
                `<a target="_blank" href="${artist.url}">${artist.name}</a>`
            )
            .join(", ");

          let previewElement = <div style={{ height: "24px" }}></div>;

          if (track.preview_url) {
            const isActiveTrack = track.id === activeTrackId;

            if (!isActiveTrack) {
              previewElement = (
                <button onClick={() => setActiveTrack(track.id)}>
                  <PlayIcon />
                </button>
              );
            } else {
              previewElement = (
                <button onClick={() => setActiveTrack("")}>
                  <PauseIcon />
                </button>
              );
            }
          }

          return (
            <tr className="playlist-tracks-track">
              <td className="playlist-tracks-track-info preview-icon">
                {previewElement}
              </td>
              <td className="playlist-tracks-track-info title">
                <a target="_blank" href={track.url}>
                  {track.title}
                </a>
              </td>
              <td
                className="playlist-tracks-track-info artist"
                dangerouslySetInnerHTML={{ __html: artists }}
              />
              <td className="playlist-tracks-track-info album">
                <a target="_blank" href={track.album.url}>
                  {track.album.name}
                </a>
              </td>
              <td className="playlist-tracks-track-info length">
                {track.length.readable_length}
              </td>
              {showDates && (
                <td className="playlist-tracks-track-info date">
                  <a target="_blank" href={track.playlistUrl}>
                    {track.date}
                  </a>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PlaylistTracks;
