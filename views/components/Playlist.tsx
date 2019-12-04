import { route } from "preact-router";
import { Playlist as PlaylistInterface } from "../../shared/interfaces";

import LinkIcon from "../img/icons/link.svg";
import NextIcon from "../img/icons/next.svg";
import PrevIcon from "../img/icons/prev.svg";

import PlaylistTracks from "./PlaylistTracks";

interface PlaylistObject {
	[key: string]: PlaylistInterface;
}

interface PlaylistProps {
	path: string;
	playlistsById: PlaylistObject;
	sortedPlaylistIds: string[];
	activePlaylistId?: string;
}

const Playlist = ({ playlistsById, activePlaylistId, sortedPlaylistIds }: PlaylistProps) => {
	if (!activePlaylistId || Object.keys(playlistsById).length === 0) { return <div>LOD</div>; }
	if (!playlistsById[activePlaylistId]) { return <div>Ya goofd</div>; }

	const playlist = playlistsById[activePlaylistId];

	let activePlaylistIndex = -1;

	for (const [index, sortedId] of sortedPlaylistIds.entries()) {
		if (sortedId === activePlaylistId) {
			activePlaylistIndex = index;
			break;
		}
	}

	const previousPlaylist = () => {
		const previousPlaylistId = sortedPlaylistIds[activePlaylistIndex + 1];
		route(`/id/${previousPlaylistId}`);
	};

	const nextPlaylist = () => {
		const nextPlaylistId = sortedPlaylistIds[activePlaylistIndex - 1];
		route(`/id/${nextPlaylistId}`);
	};

	const prevButtonDisabled = (activePlaylistIndex + 1) === sortedPlaylistIds.length;
	const nextButtonDisabled = activePlaylistIndex === 0;

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
							<div className="playlist-info-text-header-nav-wrapper">
								<button
									className="playlist-info-text-header-nav-button prev"
									disabled={prevButtonDisabled}
									onClick={() => previousPlaylist()}
								>
									<PrevIcon />
								</button>
									<a href={playlist.url} target="_blank" className="playlist-info-text-header-link-icon">
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
