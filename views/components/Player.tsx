import { useEffect, useState } from "preact/hooks";
import { Track } from "../../shared/interfaces";

interface PlayerProps {
	track: Track;
	setActiveTrack: (trackId: string) => void;
}

const Player = ({ track, setActiveTrack }: PlayerProps) => {
	const [volume, setVolume] = useState(1);
	const fadeoutStart = 25000;

	useEffect(() => {
		if (!track) {
			return;
		}

		let fadeoutInterval: any;
		setVolume(1);

		const fadeoutTimeout = setTimeout(() => {
			let newVolume = volume;

			fadeoutInterval = setInterval(() => {
				newVolume = newVolume - .05;
				if (newVolume <= 0) {
					setVolume(0);
					return clearInterval(fadeoutInterval);
				}

				setVolume(newVolume);
			}, fadeoutStart / 100 );
		}, fadeoutStart);

		return () => {
			clearTimeout(fadeoutTimeout);
			clearInterval(fadeoutInterval);
		};
	}, [track]);

	const endSong = () => {
		setActiveTrack("");
	};

	return (
		<div className="nav-player">
			<audio
				volume={volume}
				src={track.preview_url}
				autoPlay
				onEnded={() => endSong()}
			/>
		</div>
	);
};

export default Player;
