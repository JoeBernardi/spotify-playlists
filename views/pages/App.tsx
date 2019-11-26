import { useEffect, useState } from "preact/hooks";

import { Playlist as PlaylistInterface } from "../../shared/interfaces";
import Playlist from "../components/Playlist";

interface MainProps {
	path: string; // this sucks haha
	getPlaylists: () => Promise<void>;
	playlists: PlaylistInterface[];
}

const Main = ({ getPlaylists, playlists }: MainProps) => {
	const [isLoading, setIsLoading] = useState(!playlists.length);

	useEffect(() => {
		getPlaylists().then(() => {
			setIsLoading(false);
		});
	}, []);

	return (
		<div>
			{isLoading
				&& <div>Loading</div>
			}
			{(!isLoading && playlists)
				&& <div>
					{playlists.map((playlist: PlaylistInterface) => <Playlist playlist={playlist} />)}
				</div>
			}
		</div>
	);
};

export default Main;
