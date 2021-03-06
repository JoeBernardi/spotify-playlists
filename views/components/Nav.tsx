import { Link } from "preact-router/match";
import { useState } from "preact/hooks";
import { Playlist, Track } from "../../shared/interfaces";

import MinusIcon from "../img/icons/minus.svg";
import PlusIcon from "../img/icons/plus.svg";

import NavItem from "./NavItem";
import Player from "./Player";

interface PlaylistObject {
	[key: string]: Playlist;
}

interface TrackObject {
	[key: string]: Track;
}

interface NavProps {
	path?: string;
	activeTrackId: string;
	setActiveTrack: (trackId: string) => void;
	sortedPlaylistIds: string[];
	playlistsById: PlaylistObject;
	tracksById: TrackObject;
}

const Nav = ({
		sortedPlaylistIds,
		playlistsById,
		activeTrackId,
		tracksById,
		setActiveTrack,
	}: NavProps) => {
	const [activeYear, setActiveYear] = useState("");

	const toggleYear = (year: string) => {
		if (year === activeYear) {
			return setActiveYear("");
		}

		return setActiveYear(year);
	};

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

		let yearClasses = "nav-playlists-year";
		let iconComponent = <PlusIcon />;

		if (year === activeYear) {
			yearClasses += " active";
			iconComponent = <MinusIcon />;
		}

		return (
			<div className={yearClasses}>
				<div className="nav-playlists-year-header" onClick={() => toggleYear(year)}>
					<h3 className="nav-playlists-year-header-title">
						{year}
					</h3>
					<div className="nav-playlists-year-header-icon">
						{iconComponent}
					</div>
				</div>
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
				{!!sortedPlaylistIds.length
					&& <section className="nav-playlists">
						{navByYear}
					</section>
				}
				{!!(tracksById && tracksById[activeTrackId])
					&& <Player
						track={tracksById[activeTrackId]}
						setActiveTrack={setActiveTrack}
					/>
				}
				<section className="nav-meta">
					<Link activeClassName="active" className="nav-meta-title" href="/about">About</Link>
				</section>
			</nav>
		</section>
	);
};

export default Nav;
