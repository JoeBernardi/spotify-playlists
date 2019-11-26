import { Playlist } from "../../shared/interfaces";

interface PlaylistProp {
	playlist: Playlist;
}

const Playlist = ({ playlist }: PlaylistProps) => {
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
