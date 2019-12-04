import bent from "bent";
import createStore from "unistore";
import devtools from "unistore/devtools";

import { Playlist, Track } from "../shared/interfaces";

import { millisecondsToReadableTime } from "../shared/helpers";

const getJson = bent("GET", "json", 200, 422, 500);

export const actions = () => ({
	getPlaylists: async (state: object): Promise<object> => {
		console.log(`${window.location.protocol}//${window.location.host}/playlists`);
		const allPlaylists = await getJson(`${window.location.protocol}//${window.location.host}/playlists`)
			.catch((e: Error) => Promise.reject(e));

		const playlistsById = allPlaylists.reduce((byId: any, playlist: Playlist) => {
			byId[playlist.id] = playlist;
			return byId;
		}, {});

		const sortedPlaylistIds = allPlaylists.map((playlist: Playlist) => playlist.id);

		const allTracks = allPlaylists.reduce((acc: any, playlist: Playlist) => {
			return acc.concat(playlist.tracks);
		}, []);

		const totalTrackLength = millisecondsToReadableTime(allTracks.reduce((acc: number, track: Track) => {
			return acc + track.length.total_ms;
		}, 0));

		return {
			...state,
			playlistsById,
			totalTrackLength,
			allTracks,
			sortedPlaylistIds
		};
	},
});

export const initialState = {
	totalTrackLength: 0,
	sortedPlaylistIds: [],
	allTracks: [],
	playlistsById: {},
};

const storeExport = (state: object) => (process.env.NODE_ENV === "production"
	? createStore(state)
	: devtools(createStore(state)));

export default storeExport;
