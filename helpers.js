import dotenv from "dotenv";
import SpotifyWebApi from "spotify-web-api-node";

import { playlistLimit } from "./consts";

export const getEnv = () => dotenv.config().parsed;

export const createApiInstance = () => {
	return new SpotifyWebApi({
		clientId: getEnv().SPOTIFY_CLIENT_ID,
		clientSecret: getEnv().SPOTIFY_SECRET,
		redirectUri: getEnv().REDIRECT_URI
	});
};

export const getPlaylists = async apiInstance => {
	let playlists = [];

	const getPlaylistsFromServer = async (offset = 0) => {
		const data = await apiInstance.getUserPlaylists(getEnv().SPOTIFY_USER, {
			limit: playlistLimit,
			offset
		});

		const { items, next } = data.body;

		if (items) {
			const fullPlaylists = await Promise.all(
				items.map(playlist => apiInstance.getPlaylist(playlist.id))
			)

			playlists = playlists.concat(fullPlaylists.map((response) => response.body));
		}

		if (next) {
			return getPlaylistsFromServer(offset + playlistLimit);
		}

		return true;
	};

	await getPlaylistsFromServer();

	return playlists;
};

export default {
	getEnv,
	getPlaylists,
	createApiInstance
};
