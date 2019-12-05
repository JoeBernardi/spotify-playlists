import { useState } from "preact/hooks";
import { Track } from "../../shared/interfaces";

interface PlayerProps {
	track: Track;
	setActiveTrack: (trackId: string) => void;
}

const Player = ({ track, setActiveTrack }: PlayerProps) => {
	const [volume, setVolume] = useState(1);
	const fadeoutStart = 25000;
	let fadeoutTimeout: any;

	const playSong = () => {
		setVolume(1);

		fadeoutTimeout = setTimeout(() => {
			let newVolume = volume;

			const fadeoutInterval: any = setInterval(() => {
				newVolume = newVolume - .05;
				if (newVolume <= 0) {
					return clearInterval(fadeoutInterval);
				}

				setVolume(newVolume);
			}, fadeoutStart / 100 );
		}, fadeoutStart);
	};

	const pauseSong = () => {
		if (fadeoutTimeout) {
			clearTimeout(fadeoutTimeout);
		}
	};

	const endSong = () => {
		setActiveTrack("");
	};

	return (
		<div className="nav-player">
			<audio
				volume={volume}
				src={track.preview_url}
				autoPlay
				onPlay={() => playSong()}
				onPause={() => pauseSong()}
				onEnded={() => endSong()}
			/>
		</div>
	);
};

export default Player;
