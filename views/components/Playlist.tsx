import { Playlist as PlaylistInterface } from "../../shared/interfaces";
import ClockIcon from "../img/icons/clock.svg";
import LinkIcon from "../img/icons/link.svg";

interface PlaylistObject {
	[key: string]: PlaylistInterface;
}

interface PlaylistProps {
	path: string;
	playlistsById: PlaylistObject;
	activePlaylistId?: string;
}

const Playlist = ({ playlistsById, activePlaylistId }: PlaylistProps) => {
	if (!activePlaylistId || Object.keys(playlistsById).length === 0) { return <div>LOD</div>; }
	if (!playlistsById[activePlaylistId]) { return <div>Ya goofd</div>; }

	const playlist = playlistsById[activePlaylistId];

	return (
		<section className="playlist">
			<div className="playlist-info">
				{playlist.image
					&& <div className="playlist-info-image">
						<img src={playlist.image} alt={playlist.title} />
					</div>
				}
				<div className="playlist-info-text">
					<div className="playlist-info-text-header">
						<h2 className="playlist-info-text-header-title">{playlist.title}</h2>
						<a href={playlist.url} target="_blank" className="playlist-info-text-header-link-icon">
							<LinkIcon />
						</a>
					</div>
					{playlist.description
						&& <p className="playlist-info-text-description" dangerouslySetInnerHTML={{__html: playlist.description}} />
					}
				</div>
			</div>
			<table className="playlist-tracks">
				<thead className="playlist-tracks-info">
					<tr>
						<th className="playlist-tracks-info-type" scope="col">Title</th>
						<th className="playlist-tracks-info-type" scope="col">Artist</th>
						<th className="playlist-tracks-info-type" scope="col">Album</th>
						<th className="playlist-tracks-info-type icon" scope="col"><ClockIcon /></th>
					</tr>
				</thead>
				<tbody>
				{playlist.tracks.map((track) => {
					const artists = track.artist.map((artist) => `<a target="_blank" href="${artist.url}">${artist.name}</a>`).join(", ");
					const readableLength = `${track.length.minutes}:${track.length.seconds}`;

					return (
						<tr className="playlist-tracks-track">
							<td className="playlist-tracks-track-info"><a target="_blank" href={track.url}>{track.title}</a></td>
							<td className="playlist-tracks-track-info" dangerouslySetInnerHTML={{__html: artists}} />
							<td className="playlist-tracks-track-info"><a target="_blank" href={track.album.url}>{track.album.name}</a></td>
							<td className="playlist-tracks-track-info">{readableLength}</td>
						</tr>
					);
				})}
				</tbody>
			</table>
		</section>
	);
};

export default Playlist;
