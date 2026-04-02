/**
 * API configuration utility
 * Handles different environments (development, production, etc.)
 */

import type { Playlist, Track } from "@spotify-playlists/shared";

const inflightTrackRequests = new Map<string, Promise<Track[]>>();

const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl;
  }

  if (import.meta.env.DEV) {
    // In local dev, use Vite proxy so the browser calls /playlists on 5173.
    return "";
  }

  return window.location.origin;
};

export const API_BASE_URL = getApiBaseUrl();

const fetchNoStore = (input: string) =>
  fetch(input, { cache: "no-store" });

export interface PlaylistStats {
  playlistCount: number;
  totalTrackCount: number;
  totalDurationMs: number;
}

export const fetchPlaylists = async (): Promise<Playlist[]> => {
  const response = await fetchNoStore(`${API_BASE_URL}/playlists`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch playlists: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as Playlist[];
};

export const fetchStats = async (): Promise<PlaylistStats> => {
  const response = await fetchNoStore(`${API_BASE_URL}/playlists/stats`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch stats: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as PlaylistStats;
};

export const fetchPlaylistTracks = async (id: string): Promise<Track[]> => {
  const existingRequest = inflightTrackRequests.get(id);
  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
    const response = await fetchNoStore(
      `${API_BASE_URL}/playlists/${id}/tracks`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch tracks: ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as Track[];
  })();

  inflightTrackRequests.set(id, request);

  try {
    return await request;
  } finally {
    inflightTrackRequests.delete(id);
  }
};
