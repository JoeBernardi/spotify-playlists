/**
 * API configuration utility
 * Handles different environments (development, production, etc.)
 */

import type { Playlist } from "@spotify-playlists/shared";

const getApiBaseUrl = (): string => {
  // In development, use localhost
  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }

  // In production, use the same origin (assuming the server serves the client)
  // or use environment variable if set
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl;
  }

  // Fallback to same origin for production
  return window.location.origin;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Fetch playlists from the API
 */
export const fetchPlaylists = async (): Promise<Playlist[]> => {
  const response = await fetch(`${API_BASE_URL}/playlists`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch playlists: ${response.status} ${response.statusText}`
    );
  }

  const playlists = (await response.json()) as Playlist[];
  return playlists;
};
