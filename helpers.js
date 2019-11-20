import dotenv from "dotenv";
import NodeCache from "node-cache";
import SpotifyWebApi from "spotify-web-api-node";

import { playlistLimit, cacheTTLInSeconds, cacheKey } from "./consts";

export const getEnv = () => dotenv.config().parsed;

const { SPOTIFY_USER } = getEnv();
const playlistCache = new NodeCache({ stdTTL: cacheTTLInSeconds });

const apiInstance = new SpotifyWebApi({
	clientId: getEnv().SPOTIFY_CLIENT_ID,
	clientSecret: getEnv().SPOTIFY_SECRET,
	redirectUri: getEnv().REDIRECT_URI
});

const getPlaylists = async (apiInstance) => {
	let playlists = [];

	const getPlaylistsFromServer = async (offset = 0) => {
		const data = await apiInstance.getUserPlaylists(getEnv().SPOTIFY_USER, {
			limit: playlistLimit,
			offset
		})

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

	await getPlaylistsFromServer()
		.catch((e) => Promise.reject(e));

	return playlists;
};

const normalizeTracks = (tracksFromApi) => {
	return tracksFromApi.map((track) => {
		const {
			name,
			duration_ms,
			preview_url,
		} = track.track;

		const artists = track.track.artists.map((artist) => {
			return {
				url: artist.external_urls.spotify,
				name: artist.name
			}
		});

		return {
			artist: artists,
			title: name,
			duration_ms,
			preview_url,

		}
	})
}

const normalizePlaylists = (playlistsFromApi) => {
	return playlistsFromApi.map((playlist) => {
		return {
			description: playlist.description,
			title: playlist.name,
			image: playlist.images[0].url,
			tracks: normalizeTracks(playlist.tracks.items),
		}
	})
}

export const authAndFetchPlaylists = async () => {
	const cachedPlaylists = playlistCache.get(cacheKey);

	if (cachedPlaylists) {
		return cachedPlaylists;
	}

	const data = await apiInstance.clientCredentialsGrant();
	const { access_token } = data.body;
	apiInstance.setAccessToken(access_token);

	return getPlaylists(apiInstance, 0)
		.then((playlists) => {
			const normalizedPlaylists = normalizePlaylists(playlists);
			playlistCache.set(cacheKey, normalizedPlaylists);
			return Promise.resolve(normalizedPlaylists);
		})
		.catch((e) => e);
}

export default {
	authAndFetchPlaylists,
	getEnv,
};
