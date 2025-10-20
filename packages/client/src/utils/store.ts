import { atom, type Atom } from "jotai";
import type { Playlist, Track } from "@spotify-playlists/shared";

export const playlistsAtom = atom<Playlist[]>([]);
export const setPlaylistsAtom = atom(
  null,
  (_get, set, playlists: Playlist[]) => {
    set(playlistsAtom, playlists);
  }
);
export const tracksAtom: Atom<Track[]> = atom((get) => {
  const playlists = get(playlistsAtom);
  return playlists.flatMap((playlist) => playlist.tracks || []);
});

export const activeTrackIdAtom = atom<string>("");

export const isLoadingAtom = atom<boolean>(true);
export const errorAtom = atom<string | null>(null);
