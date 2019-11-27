export interface Track {
	artist: Artist[];
	duration_ms: number;
	preview_url: string;
	title: string;
}

export interface Artist {
	name: string;
	url: string;
}

export interface Playlist {
	description?: string;
	image?: string;
	title: string;
	id: string;
	year: string;
	month: string;
	tracks: Track[];
}
