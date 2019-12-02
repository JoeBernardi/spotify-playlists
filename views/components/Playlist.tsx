import { Playlist as PlaylistInterface } from "../../shared/interfaces";

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
					<a className="playlist-info-text-title" href={playlist.url}>{playlist.title}</a>
					{playlist.description
						&& <p className="playlist-info-text-description" dangerouslySetInnerHTML={{__html: playlist.description}} />
					}
				</div>
			</div>
			<table className="playlist-tracks">
				<thead>
					<th scope="col">Title</th>
					<th scope="col">Artist</th>
					<th scope="col">Album</th>
					<th scope="col">Length</th>
				</thead>
				<tbody>
				{playlist.tracks.map((track) => {
					const artists = track.artist.map((artist) => `<a target="_blank" href="${artist.url}">${artist.name}</a>`).join(", ");
					const readableLength = `${track.length.minutes}:${track.length.seconds}`;

					return (
						<tr className="playlist-tracks-track">
							<td><a target="_blank" href={track.url}>{track.title}</a></td>
							<td dangerouslySetInnerHTML={{__html: artists}} />
							<td><a target="_blank" href={track.album.url}>{track.album.name}</a></td>
							<td>{readableLength}</td>
						</tr>
					);
				})}
				</tbody>
			</table>
		</section>
	);
};

export default Playlist;
