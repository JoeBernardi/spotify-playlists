import { Track as TrackInterface } from "../../shared/interfaces";
import ClockIcon from "../img/icons/clock.svg";
import PauseIcon from "../img/icons/pause.svg";
import PlayIcon from "../img/icons/play.svg";

interface PlaylistTracksProps {
	path?: string;
	activeTrackId: string;
	setActiveTrack: (trackUrl: string) => void;
	tracks: TrackInterface[];
}

const PlaylistTracks = ({ tracks, setActiveTrack, activeTrackId }: PlaylistTracksProps) => {
	return (
		<table className="playlist-tracks">
			<thead className="playlist-tracks-info">
				<tr>
					<th className="playlist-tracks-info-type preview" scope="col">&nbsp;</th>
					<th className="playlist-tracks-info-type title" scope="col">Title</th>
					<th className="playlist-tracks-info-type artist" scope="col">Artist</th>
					<th className="playlist-tracks-info-type album" scope="col">Album</th>
					<th className="playlist-tracks-info-type length icon" scope="col"><ClockIcon /></th>
				</tr>
			</thead>
			<tbody>
			{tracks.map((track) => {
				const artists = track.artist
					.map((artist) => `<a target="_blank" href="${artist.url}">${artist.name}</a>`).join(", ");

				let previewElement = <div style={{height: "24px"}}></div>;

				if (track.preview_url) {
					const isActiveTrack = track.id === activeTrackId;

					if (!isActiveTrack) {
						previewElement = <PlayIcon strokeWidth="1" onClick={() => setActiveTrack(track.id)} />;
					} else {
						previewElement = <PauseIcon strokeWidth="1"  onClick={() => setActiveTrack("")} />;
					}
				}

				return (
					<tr className="playlist-tracks-track">
						<td className="playlist-tracks-track-info preview-icon">
							{previewElement}
						</td>
						<td className="playlist-tracks-track-info title"><a target="_blank" href={track.url}>{track.title}</a></td>
						<td className="playlist-tracks-track-info artist" dangerouslySetInnerHTML={{__html: artists}} />
						<td className="playlist-tracks-track-info album">
							<a target="_blank" href={track.album.url}>{track.album.name}</a>
						</td>
						<td className="playlist-tracks-track-info length">{track.length.readable_length}</td>
					</tr>
				);
			})}
			</tbody>
		</table>
	);
};

export default PlaylistTracks;
