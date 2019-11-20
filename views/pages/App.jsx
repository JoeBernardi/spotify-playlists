import PropTypes from "prop-types";
import { useState, useEffect } from "preact/hooks";

const Main = ({ getPlaylists, playlists }) => {
	const [isLoading, setIsLoading] = useState(!playlists.length);

	useEffect(() => {
		getPlaylists().then(() => {
			setIsLoading(false);
			console.log(playlists);
		});
	}, []);

	return (
		<div>
			{isLoading
				&& <div>LOd</div>
			}
			{!isLoading
				&& <div>Suces</div>
			}
		</div>
	)
};

Main.propTypes = {
	getPlaylists: PropTypes.func.isRequired,
	playlists: PropTypes.array.isRequired,
}

export default Main;
