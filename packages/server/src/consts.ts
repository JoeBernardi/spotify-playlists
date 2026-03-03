export const cacheKey = "playlists";
export const cacheTTLInSeconds = 2592000; // 30 days

/** Playlists older than this (by month) are persisted to JSON and served from disk */
export const STABLE_PLAYLIST_AGE_DAYS = 60;
export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const MONTH_TO_NUMBER: Record<(typeof months)[number], number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};
export const playlistLimit = 50;

/** Delay between playlist track fetches to avoid Spotify rate limits (~180/min) */
export const TRACK_FETCH_DELAY_MS = 150;
