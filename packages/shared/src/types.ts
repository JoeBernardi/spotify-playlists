export interface Track {
  artist: Artist[];
  album: Album;
  length: {
    total_ms: number;
    readable_length: string;
  };
  preview_url?: string | null;
  image: string;
  title: string;
  id: string;
  url: string;
  date: string;
  playlistUrl: string;
}

export interface Artist {
  name: string;
  url: string;
}

export interface Album {
  name: string;
  url: string;
}

export interface Playlist {
  description?: string;
  image?: string;
  title: string;
  id: string;
  url: string;
  year: string;
  month: string;
  tracks: Track[];
}
