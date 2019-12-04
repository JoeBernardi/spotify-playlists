import { Track as TrackInterface } from "../../shared/interfaces";
import ClockIcon from "../img/icons/clock.svg";

interface PlaylistTracksProps {
	path: string;
	tracks: TrackInterface[];
}

const PlaylistTracks = ({ tracks }: PlaylistTracksProps) => {
	return (
		<table className="playlist-tracks">
			<thead className="playlist-tracks-info">
				<tr>
					<th className="playlist-tracks-info-type" scope="col">Title</th>
					<th className="playlist-tracks-info-type" scope="col">Artist</th>
					<th className="playlist-tracks-info-type" scope="col">Album</th>
					<th className="playlist-tracks-info-type icon" scope="col"><ClockIcon /></th>
				</tr>
			</thead>
			<tbody>
			{tracks.map((track) => {
				const artists = track.artist
					.map((artist) => `<a target="_blank" href="${artist.url}">${artist.name}</a>`).join(", ");

				return (
					<tr className="playlist-tracks-track">
						<td className="playlist-tracks-track-info"><a target="_blank" href={track.url}>{track.title}</a></td>
						<td className="playlist-tracks-track-info" dangerouslySetInnerHTML={{__html: artists}} />
						<td className="playlist-tracks-track-info"><a target="_blank" href={track.album.url}>{track.album.name}</a></td>
						<td className="playlist-tracks-track-info">{track.length.readable_length}</td>
					</tr>
				);
			})}
			</tbody>
		</table>
	);
};

export default PlaylistTracks;
