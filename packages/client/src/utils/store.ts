import { atom, type Atom } from "jotai";
import type { Playlist, Track } from "@spotify-playlists/shared";

export const playlistsAtom = atom<Playlist[]>([]);
export const setPlaylistsAtom = atom(
  null,
  (_get, set, playlists: Playlist[]) => {
    set(playlistsAtom, playlists);
  },
);

export const loadedTrackIdsAtom = atom<Set<string>>(new Set<string>());

export const setPlaylistTracksAtom = atom(
  null,
  (get, set, { id, tracks }: { id: string; tracks: Track[] }) => {
    const playlists = get(playlistsAtom);
    const match = playlists.find((p) => p.id === id);
    if (!match) {
      console.warn(
        `setPlaylistTracks: no playlist matched id "${id}". Available ids:`,
        playlists.map((p) => p.id),
      );
    }
    set(
      playlistsAtom,
      playlists.map((p) => (p.id === id ? { ...p, tracks } : p)),
    );
    set(loadedTrackIdsAtom, new Set([...get(loadedTrackIdsAtom), id]));
  },
);

export const tracksAtom: Atom<Track[]> = atom((get) => {
  const playlists = get(playlistsAtom);
  return playlists.flatMap((playlist) => playlist.tracks || []);
});

export const isLoadingAtom = atom<boolean>(true);
