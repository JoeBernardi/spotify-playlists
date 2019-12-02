import Router from "preact-router";
import { useEffect } from "preact/hooks";
import { connect } from "unistore/preact";

import { Playlist as PlaylistInterface } from "../shared/interfaces";

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
	useEffect(() => {
		props.getPlaylists();
	}, []);

	return (
		<section className="wrapper">
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
	);
};

export default connect((props) => props, actions)(appRouter);
