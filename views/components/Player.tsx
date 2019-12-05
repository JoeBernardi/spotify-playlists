import { useState } from "preact/hooks";
import { Track } from "../../shared/interfaces";

interface PlayerProps {
	track: Track;
}

const Player = ({ track }: PlayerProps) => {
	const [volume, setVolume] = useState(1);
	const fadeoutStart = 25000;

	const playSong = () => {
		setVolume(1);

		setTimeout(() => {
			let newVolume = volume;

			setInterval(() => {
				newVolume = newVolume - .05;
				if (newVolume <= 0) {
					return clearInterval();
				}

				setVolume(newVolume);
			}, fadeoutStart / 100 );
		}, fadeoutStart);
	};

	return (
		<div className="nav-player">
			<audio volume={volume} src={track.preview_url} autoPlay onPlay={() => playSong()} />
		</div>
	);
};

export default Player;
