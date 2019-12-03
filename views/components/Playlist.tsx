import { Playlist as PlaylistInterface } from "../../shared/interfaces";
import LinkIcon from "../img/icons/link.svg";

import PlaylistTracks from "./PlaylistTracks";

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
			<PlaylistTracks tracks={playlist.tracks} />
		</section>
	);
};

export default Playlist;
