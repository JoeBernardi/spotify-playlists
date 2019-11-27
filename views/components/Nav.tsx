import { Link } from "preact-router/match";
import { Playlist } from "../../shared/interfaces";

interface PlaylistObject {
	[key: string]: Playlist;
}

interface NavProps {
	sortedPlaylistIds: string[];
	playlistsById: PlaylistObject;
}

const Nav = ({ sortedPlaylistIds, playlistsById }: NavProps) => {
	const allPlaylists = sortedPlaylistIds.map((playlistId: string) => playlistsById[playlistId]);
	const playlistsByYear = allPlaylists.reduce((acc: any, playlist: any): any => {
		if (!acc[playlist.year]) { acc[playlist.year] = []; }
		acc[playlist.year].push(playlist);
		return acc;
	}, {});

	const navByYear = Object.keys(playlistsByYear).reverse().map((year) => {
		const yearOfPlaylists = playlistsByYear[year];
		const yearLists = yearOfPlaylists
			.map((playlist: Playlist) => <li><Link activeClassName="active" href={`/id/${playlist.id}`}>{playlist.month}</Link></li>);

		return (
			<div>
				<div>
					{year}
				</div>
				<ul>
					{yearLists}
				</ul>
			</div>
		);
	});

	return (
		<nav>
			{navByYear}
		</nav>
	);
};

export default Nav;
