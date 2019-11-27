import { Fragment } from "preact";
import Router from "preact-router";
import { useEffect, useState } from "preact/hooks";
import { connect } from "unistore/preact";

import { Playlist as PlaylistInterface } from "../shared/interfaces";

import Nav from "./components/Nav";
import Playlist from "./components/Playlist";

import { actions } from "./store";

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
	const [isLoading, setIsLoading] = useState(!props.sortedPlaylistIds.length);

	useEffect(() => {
		props.getPlaylists().then(() => {
			setIsLoading(false);
		});
	}, []);

	return (
		<div id="wrapper">
			<h2>Likes Song</h2>
			{!isLoading
				&& <Fragment>
					<Nav
						sortedPlaylistIds={props.sortedPlaylistIds}
						playlistsById={props.playlistsById}
					/>
					<Router>
						<Playlist
							path="/id/:activePlaylistId?"
							playlistsById={props.playlistsById}
						/>
					</Router>
				</Fragment>
			}
		</div>
	);
};

export default connect((props) => props, actions)(appRouter);
