import Router from "preact-router";
import { useEffect, useState } from "preact/hooks";
import { connect } from "unistore/preact";
import WebFont from "webfontloader";

import { Playlist as PlaylistInterface } from "../shared/interfaces";

import Loader from "./components/Loader";
import Nav from "./components/Nav";
import Playlist from "./components/Playlist";

import { actions } from "./store";

import "./css/main.scss";

interface PlaylistObject {
	[key: string]: PlaylistInterface;
}

interface AppProps {
	path: string; // this sucks haha
	getPlaylists: () => Promise<void>;
	sortedPlaylistIds: string[];
	playlistsById: PlaylistObject;
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
					/>
					<section className="content">
						<Router>
							<Playlist
								path="/id/:activePlaylistId?"
								playlistsById={props.playlistsById}
							/>
							<Playlist
								path="/"
								playlistsById={props.playlistsById}
								activePlaylistId={props.sortedPlaylistIds[0]}
							/>
						</Router>
					</section>
				</section>
			}
			{!isLoaded
				&& <Loader />
			}
		</div>
	);
};

export default connect((props) => props, actions)(appRouter);
