import dotenv from "dotenv";
import NodeCache from "node-cache";
import SpotifyWebApi from "spotify-web-api-node";

import { Artist, Playlist, Track } from "../shared/interfaces";

import { cacheKey, cacheTTLInSeconds, months, playlistLimit } from "./consts";

export const getEnv = (): any => dotenv.config().parsed;

const playlistCache: NodeCache = new NodeCache({ stdTTL: cacheTTLInSeconds });

const apiInstance = new SpotifyWebApi({
	clientId: getEnv().SPOTIFY_CLIENT_ID,
	clientSecret: getEnv().SPOTIFY_SECRET,
	redirectUri: getEnv().REDIRECT_URI
});

const getPlaylists = async (spotifyAPI: SpotifyWebApi): Promise<object[] | Error> => {
	let playlists: object[] = [];

	const getPlaylistsFromServer = async (offset = 0): Promise<object[]> => {
		const data = await spotifyAPI.getUserPlaylists(getEnv().SPOTIFY_USER, {
			limit: playlistLimit,
			offset
		});

		const { items, next } = data.body;

		if (items) {
			const fullPlaylists = await Promise.all(
				items.map((playlist) => spotifyAPI.getPlaylist(playlist.id))
			);

			playlists = playlists.concat(fullPlaylists.map((response) => response.body));
		}

		if (next) {
			return getPlaylistsFromServer(offset + playlistLimit);
		}

		return playlists;
	};

	return await getPlaylistsFromServer()
		.catch((e: Error) => Promise.reject(e));
};

const normalizeTracks = (tracksFromApi: any[]): Track[] => {
	return tracksFromApi.map((track: any) => {
		const {
			name,
			duration_ms,
			preview_url,
		} = track.track;

		const artists = track.track.artists.map((artist: any): Artist => {
			return {
				name: artist.name,
				url:  artist.external_urls.spotify,
			};
		});

		return {
			artist: artists,
			duration_ms,
			preview_url,
			title: name,
		};
	});
};

const normalizePlaylists = (playlistsFromApi: any[]): Playlist[] => {
	return playlistsFromApi
		.filter((playlist: any) => months.indexOf(playlist.name.split(" ")[0]) > -1)
		.map((playlist: any) => {
			return {
				description: playlist.description,
				id: playlist.id,
				image: playlist.images[0].url,
				title: playlist.name,
				month: playlist.name.split(" ")[0],
				year: playlist.name.split(" ")[1],
				tracks: normalizeTracks(playlist.tracks.items),
			};
		})
		.sort((a, b) => new Date(b.title) > new Date(a.title) ? 1 : -1);
};

export const authAndFetchPlaylists = async (): Promise<Playlist[] | Error> => {
	const cachedPlaylists: Playlist[] | undefined = playlistCache.get(cacheKey);

	if (cachedPlaylists) {
		return cachedPlaylists;
	}

	const data = await apiInstance.clientCredentialsGrant();
	const { access_token } = data.body;
	apiInstance.setAccessToken(access_token);

	return getPlaylists(apiInstance)
		.then((playlists: any) => {
			const normalizedPlaylists = normalizePlaylists(playlists);
			playlistCache.set(cacheKey, normalizedPlaylists);
			return Promise.resolve(normalizedPlaylists);
		})
		.catch((e: Error) => e);
};

export default {
	authAndFetchPlaylists,
	getEnv,
};
