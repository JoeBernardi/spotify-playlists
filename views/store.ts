import bent from "bent";
import createStore from "unistore";
import devtools from "unistore/devtools";

import { Playlist } from "../shared/interfaces";

const getJson = bent("GET", "json", `${process.env.PROTOCOL}${process.env.HOST}:${process.env.PORT}`, 200, 422, 500);

export const actions = () => ({
	getPlaylists: async (state: object): Promise<object> => {
		const allPlaylists = await getJson("/playlists")
			.catch((e: Error) => Promise.reject(e));

		const playlistsById = allPlaylists.reduce((byId: any, playlist: Playlist) => {
			byId[playlist.id] = playlist;
			return byId;
		}, {});

		const sortedPlaylistIds = allPlaylists.map((playlist: Playlist) => playlist.id);

		return {
			...state,
			playlistsById,
			sortedPlaylistIds
		};
	},
});

export const initialState = {
	sortedPlaylistIds: [],
	playlistsById: {},
};

const storeExport = (state: object) => (process.env.NODE_ENV === "production"
	? createStore(state)
	: devtools(createStore(state)));

export default storeExport;
