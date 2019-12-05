import Router from "preact-router";
import { useEffect, useState } from "preact/hooks";
import { connect } from "unistore/preact";
import WebFont from "webfontloader";

import { Playlist as PlaylistInterface, Track as TrackInterface } from "../shared/interfaces";

import About from "./components/About";
import Loader from "./components/Loader";
import MobileFooter from "./components/MobileFooter";
import Nav from "./components/Nav";
import Playlist from "./components/Playlist";
import PlaylistTracks from "./components/PlaylistTracks";

import { actions } from "./store";

import "./css/main.scss";

interface PlaylistObject {
	[key: string]: PlaylistInterface;
}

interface TrackObject {
	[key: string]: TrackInterface;
}

interface AppProps {
	getPlaylists: () => Promise<void>;
	setActiveTrack: () => void;
	activeTrackId: string;
	totalTrackLength: number;
	sortedPlaylistIds: string[];
	allTracks: TrackInterface[];
	playlistsById: PlaylistObject;
	tracksById: TrackObject;
	activePlaylistId?: string;
}

const appRouter = (props: AppProps) => {
	const [fontsLoaded, setFontsLoaded] = useState(false);

	useEffect(() => {
		props.getPlaylists();

		WebFont.load({
			google: {
				families: ["Poppins:300,600,700,800", "Roboto Mono"]
			},
			active: () => setFontsLoaded(true)
		});

	}, []);

	const isLoaded = fontsLoaded && !!props.sortedPlaylistIds.length;
	return (
		<div>
			{isLoaded
				&& <section className="wrapper">
					<Nav
						sortedPlaylistIds={props.sortedPlaylistIds}
						playlistsById={props.playlistsById}
						activeTrackId={props.activeTrackId}
						tracksById={props.tracksById}
					/>
					<section className="content">
						<Router>
							<About
								path="/about"
								totalTrackLength={props.totalTrackLength}
								totalTrackCount={props.allTracks.length}
							/>
							<PlaylistTracks
								path="/everything"
								tracks={props.allTracks}
								setActiveTrack={props.setActiveTrack}
								activeTrackId={props.activeTrackId}
							/>
							<Playlist
								path="/id/:activePlaylistId?"
								sortedPlaylistIds={props.sortedPlaylistIds}
								playlistsById={props.playlistsById}
								setActiveTrack={props.setActiveTrack}
								activeTrackId={props.activeTrackId}
							/>
							<Nav
								path="/nav"
								activeTrackId={props.activeTrackId}
								sortedPlaylistIds={props.sortedPlaylistIds}
								playlistsById={props.playlistsById}
								tracksById={props.tracksById}
							/>
							<Playlist
								path="/"
								sortedPlaylistIds={props.sortedPlaylistIds}
								playlistsById={props.playlistsById}
								activePlaylistId={props.sortedPlaylistIds[0]}
								setActiveTrack={props.setActiveTrack}
								activeTrackId={props.activeTrackId}
							/>
						</Router>
					</section>
					<MobileFooter />
				</section>
			}
			{!isLoaded
				&& <Loader />
			}
		</div>
	);
};

export default connect((props) => props, actions)(appRouter);
