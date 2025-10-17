import dotenv from "dotenv";
import NodeCache from "node-cache";

import {
  millisecondsToReadableTime,
  Playlist,
  Track,
} from "@spotify-playlists/shared";

import { cacheKey, cacheTTLInSeconds, months } from "./consts";
import {
  SpotifyApi,
  Playlist as SpotifyPlaylist,
  Track as SpotifyTrack,
  PlaylistedTrack,
} from "@spotify/web-api-ts-sdk";

export const getEnv = (): any => dotenv.config().parsed;

export const playlistCache: NodeCache = new NodeCache({
  stdTTL: cacheTTLInSeconds,
});

getEnv();

const getPlaylists = async (spotifyAPI: SpotifyApi) => {
  let playlists: SpotifyPlaylist[] = [];

  const getPlaylistsFromServer = async (offset = 0) => {
    const username: string | undefined = process.env.SPOTIFY_USER;

    if (!username) {
      return Promise.reject(Error("Bad username"));
    }

    const { items, total } = await spotifyAPI.playlists.getUsersPlaylists(
      username,
      50,
      offset
    );

    if (items && items.length > 0) {
      const fullPlaylists = await Promise.all(
        items.map((playlist) => spotifyAPI.playlists.getPlaylist(playlist.id))
      );

      playlists = playlists.concat(fullPlaylists.map((playlist) => playlist));
    }

    // If there are more playlists to fetch, recursively call this function
    if (items && items.length === 50 && playlists.length < total) {
      return await getPlaylistsFromServer(offset + 50);
    }

    return playlists;
  };

  return await getPlaylistsFromServer().catch((e: Error) => Promise.reject(e));
};

const normalizeTracks = (
  tracksFromApi: PlaylistedTrack<SpotifyTrack>[]
): Track[] => {
  return tracksFromApi.map(({ track }) => {
    const { name, duration_ms, id, album, external_urls, preview_url } = track;

    const artists = album.artists.map((artist) => {
      return {
        name: artist.name,
        url: artist.external_urls.spotify,
      };
    });

    const trackAlbum = {
      name: album.name,
      url: album.external_urls.spotify,
    };

    return {
      url: external_urls.spotify,
      image: album.images[1].url,
      artist: artists,
      length: {
        total_ms: duration_ms,
        readable_length: millisecondsToReadableTime(duration_ms),
      },
      album: trackAlbum,
      preview_url,
      id,
      title: name,
    };
  });
};

const normalizePlaylists = (
  playlistsFromApi: SpotifyPlaylist[]
): Playlist[] => {
  return playlistsFromApi
    .filter((playlist) => months.indexOf(playlist.name.split(" ")[0]) > -1)
    .map((playlist) => {
      return {
        description: playlist.description,
        url: playlist.external_urls.spotify,
        id: playlist.id,
        image: playlist.images[0].url,
        title: playlist.name,
        month: playlist.name.split(" ")[0],
        year: playlist.name.split(" ")[1],
        tracks: normalizeTracks(
          playlist.tracks.items as PlaylistedTrack<SpotifyTrack>[]
        ),
      };
    })
    .sort((a, b) => (new Date(b.title) > new Date(a.title) ? 1 : -1));
};

export const authAndFetchPlaylists = async (): Promise<Playlist[] | Error> => {
  const cachedPlaylists: Playlist[] | undefined = playlistCache.get(cacheKey);

  if (cachedPlaylists) {
    return cachedPlaylists;
  }

  const apiInstance = SpotifyApi.withClientCredentials(
    process.env.SPOTIFY_CLIENT_ID as string,
    process.env.SPOTIFY_SECRET as string,
    ["user-read-private", "user-read-email", "playlist-read-private"]
  );

  return getPlaylists(apiInstance)
    .then((playlists) => {
      const normalizedPlaylists = normalizePlaylists(playlists);
      playlistCache.set(cacheKey, normalizedPlaylists);
      return Promise.resolve(normalizedPlaylists);
    })
    .catch((e: Error) => e);
};

export default {
  authAndFetchPlaylists,
  getEnv,
  playlistCache,
};
