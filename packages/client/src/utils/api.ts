/**
 * API configuration utility
 * Handles different environments (development, production, etc.)
 */

import type { Playlist, Track } from "@spotify-playlists/shared";

const getApiBaseUrl = (): string => {
  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl;
  }

  return window.location.origin;
};

export const API_BASE_URL = getApiBaseUrl();

export interface PlaylistStats {
  playlistCount: number;
  totalTrackCount: number;
  totalDurationMs: number;
}

export const fetchPlaylists = async (): Promise<Playlist[]> => {
  const response = await fetch(`${API_BASE_URL}/playlists`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch playlists: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as Playlist[];
};

export const fetchStats = async (): Promise<PlaylistStats> => {
  const response = await fetch(`${API_BASE_URL}/playlists/stats`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch stats: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as PlaylistStats;
};

export const fetchPlaylistTracks = async (id: string): Promise<Track[]> => {
  const response = await fetch(`${API_BASE_URL}/playlists/${id}/tracks`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch tracks: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as Track[];
};
