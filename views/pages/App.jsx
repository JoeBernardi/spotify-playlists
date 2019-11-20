import PropTypes from "prop-types";
import { useState, useEffect } from "preact/hooks";

import Playlist from "../components/Playlist";

const Main = ({ getPlaylists, playlists }) => {
	const [isLoading, setIsLoading] = useState(!playlists.length);

	useEffect(() => {
		getPlaylists().then(() => {
			setIsLoading(false);
		});
	}, []);

	return (
		<div>
			{isLoading
				&& <div>LOd</div>
			}
			{(!isLoading && playlists)
				&& <div>
					{playlists.map((playlist) => <Playlist playlist={playlist} />)}
				</div>
			}
		</div>
	)
};

Main.propTypes = {
	getPlaylists: PropTypes.func.isRequired,
	playlists: PropTypes.array.isRequired,
}

export default Main;
