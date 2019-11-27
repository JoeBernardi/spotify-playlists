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
	if (!activePlaylistId || !playlistsById[activePlaylistId]) { return <div>Ya goofd</div>; }

	const playlist = playlistsById[activePlaylistId];

	return (
		<div>
			<h2>{playlist.title}</h2>
			{playlist.description
				&& <p dangerouslySetInnerHTML={{__html: playlist.description}} />
			}
			{playlist.image
				&& <img src={playlist.image} />
			}
			<ul>
				{playlist.tracks.map((track) => {
					const artists = track.artist.map((artist) => `<a target="_blank" href="${artist.url}">${artist.name}</a>`).join(", ");
					return <li><span dangerouslySetInnerHTML={{__html: artists}} /> - {track.title}</li>;
				})}
			</ul>
		</div>
	);
};

export default Playlist;
