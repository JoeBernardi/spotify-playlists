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
					<h2>{playlist.title}</h2>
					{playlist.description
						&& <p dangerouslySetInnerHTML={{__html: playlist.description}} />
					}
				</div>
			</div>
			<ul>
				{playlist.tracks.map((track) => {
					const artists = track.artist.map((artist) => `<a target="_blank" href="${artist.url}">${artist.name}</a>`).join(", ");
					return <li><span dangerouslySetInnerHTML={{__html: artists}} /> - {track.title}</li>;
				})}
			</ul>
		</section>
	);
};

export default Playlist;
