import { Link } from "preact-router/match";

// @ts-ignore
import LikesSong from "../img/likes_song.jpg";

interface AboutProps {
	totalTrackLength: string;
	totalTrackCount: number;
}

const About = ({ totalTrackLength, totalTrackCount }: AboutProps) => {
	return (
		<section className="copy">
			<img src={LikesSong} />

			<p><strong>{totalTrackCount}</strong> tunes totaling <strong>{totalTrackLength}</strong>.</p>

			<p>Awhile ago I started making playlists every month. I think it was directly inspired by John Olson's
			SUNDAZE OLZONE playlists, but lots of people do it. It's a nice way to keep track of
			stuff, whether it's something new or just something I think about for the first
			time in awhile while walking around.</p>

			<p>Even from the beginning, it was important to me for some reason that the playlists never reuse a song.
			I guess it discourages me from repeating myself? I don't know. After about a year and a half
			of making them, though, I began to second-guess whether I'd already used a given song. Spotify doesn't
			make it easy to search all your playlists at once, so I made this thing as an un-branded way to
			catalog everything. There's an undocumented page <Link activeClassName="active" href="/everything">here</Link> that
			just lists all the songs.</p>

			<p>The order of the songs doesn't matter &mdash; I typically consciously chuck a new song
			to some random location in the list instead of just appending it to the end and, as usual, the chaos
			ends up with some pretty good ideas.
			Despite all that, the first song is typically there for a reason, usually an artist that passed away
			that month, but sometimes just something that hit especially hard. I try to stash
			the weirder/longer tunes towards the end. Music is cool.</p>
		</section>
	);
};

export default About;
