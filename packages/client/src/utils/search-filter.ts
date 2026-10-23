import type { Track } from "@spotify-playlists/shared";

export const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();

export const filterTracks = (tracks: Track[], query: string) => {
  const terms = normalizeSearchText(query).trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  return tracks.filter((track) => {
    const searchable = normalizeSearchText(
      [track.title, ...track.artist.map((artist) => artist.name), track.album.name].join(" "),
    );
    return terms.every((term) => searchable.includes(term));
  });
};
