import { useEffect, useState } from "react";
import LikesSong from "../assets/img/likes_song.jpg";
import Link from "./Link";
import { fetchStats } from "../utils/api";
import { usePlaylists } from "../utils/hooks";
import { millisecondsToReadableTime } from "@spotify-playlists/shared";

const About = () => {
  const playlists = usePlaylists();
  const [stats, setStats] = useState<{
    playlistCount?: number;
    totalTrackCount: number;
    totalDurationMs: number;
  } | null>(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((err) => console.error("Failed to fetch stats:", err));
  }, []);

  const playlistCount =
    stats?.playlistCount ?? (stats ? playlists.length : "—");
  const totalTrackCount = stats?.totalTrackCount ?? "—";
  const readableTotalTrackLength = stats
    ? millisecondsToReadableTime(stats.totalDurationMs, true)
    : "—";

  return (
    <section className="copy">
      <figure>
        <img
          src={LikesSong}
          alt="Barbara Bush's favorite country song is &ldquo;Don't Come Home From Drinkin' With Lovin' On Your Mind&rdquo;"
        />
        <figcaption>
          Title c/o Jack Handey and Army Man,{" "}
          <a href="https://en.wikipedia.org/wiki/Army_Man_(magazine)">
            America's Only Magazine
          </a>
          .
        </figcaption>
      </figure>

      <p>
        <strong>{playlistCount}</strong> playlists with{" "}
        <strong>{totalTrackCount}</strong> tunes totaling{" "}
        <strong>{readableTotalTrackLength}</strong>.
      </p>

      <p>
        Awhile ago I started making playlists every month. I think it was
        directly inspired by John Olson's SUNDAZE OLZONE playlists, but lots of
        people do it. It's a nice way to keep track of stuff, whether it's
        something new or just something I think about for the first time in
        awhile while walking around.
      </p>

      <p>
        Even from the beginning, it was important to me for some reason that the
        playlists never reuse a song. I guess it forces me to keep finding new
        stuff? I don't know. After about a year and a half of making them,
        though, I began to second-guess whether I'd already used a given song.
        Spotify doesn't make it easy to search all your playlists at once, so I
        made this thing as an un-branded way to catalog everything. There's a
        page <Link href="/search">here</Link> that allows you to search all the
        songs.
      </p>

      <p>
        The order of the songs doesn't matter. I typically consciously chuck a
        new song to some random location in the list instead of just appending
        it to the end and, as usual, the chaos ends up with some pretty good
        ideas. Despite all that, the first and last songs are typically there
        for a reason&mdash;occasionally it's an artist who passed away that
        month, but sometimes it's just something that hit especially hard. I try
        to stash the weirder/longer tunes towards the end. Music is cool.
      </p>

      <p>
        &mdash; <a href="http://joe.industries">Joe B.</a>
      </p>
    </section>
  );
};

export default About;
