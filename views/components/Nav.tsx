import { Fragment } from "preact";
import { Link } from "preact-router/match";
import { Playlist } from "../../shared/interfaces";

import NavItem from "./NavItem";

interface PlaylistObject {
	[key: string]: Playlist;
}

interface NavProps {
	sortedPlaylistIds: string[];
	playlistsById: PlaylistObject;
}

const Nav = ({ sortedPlaylistIds, playlistsById }: NavProps) => {
	const allPlaylists: Playlist[] = sortedPlaylistIds.map((playlistId: string) => playlistsById[playlistId]);

	const playlistsByYear = allPlaylists.reduce((acc: any, playlist: Playlist) => {
		if (!acc[playlist.year]) { acc[playlist.year] = []; }
		acc[playlist.year].push(playlist);
		return acc;
	}, {});

	const years: string[] = Object.keys(playlistsByYear).reverse();

	const navByYear = years.map((year: string) => {
		const yearOfPlaylists: Playlist[] = playlistsByYear[year];
		const yearLists = yearOfPlaylists
			.map((playlist: Playlist) => (
				<NavItem
					href={`/id/${playlist.id}`}
					text={playlist.month}
				/>
			));

		return (
			<div className="nav-playlists-year">
				<h3>
					{year}
				</h3>
				<div className="nav-playlists-year-playlists">
					{yearLists}
				</div>
			</div>
		);
	});

	return (
		<section className="sidebar">
			<header>
				<Link href="/" activeClassName="active" className="hero">Likes Song</Link>
			</header>
			<nav>
				{sortedPlaylistIds.length
					&& <section className="nav-playlists">
						{navByYear}
					</section>
				}
			</nav>
		</section>
	);
};

export default Nav;
