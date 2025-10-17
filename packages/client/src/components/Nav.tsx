import { useState, useMemo } from "react";

import Player from "./Player";
import NavYear from "./NavYear";
import Link from "./Link";
import type { Playlist } from "@spotify-playlists/shared";
import { usePlaylists } from "../utils/hooks";

const Nav = () => {
  const playlists = usePlaylists();
  const [activeYear, setActiveYear] = useState("");

  const toggleYear = (year: string) => {
    if (year === activeYear) {
      return setActiveYear("");
    }

    return setActiveYear(year);
  };

  const playlistsByYear = useMemo(
    () =>
      playlists.reduce((acc: Record<string, Playlist[]>, playlist) => {
        if (!acc[playlist.year]) {
          acc[playlist.year] = [playlist];
        } else {
          acc[playlist.year].push(playlist);
        }
        return acc;
      }, {}),
    [playlists]
  );

  const years = Object.keys(playlistsByYear).reverse();

  return (
    <section className="sidebar">
      <header>
        <Link href="/" className="hero">
          Likes Song
        </Link>
      </header>
      <nav>
        {years.map((year) => (
          <NavYear
            year={year}
            playlists={playlistsByYear[year]}
            isActive={year === activeYear}
            toggleYear={toggleYear}
          />
        ))}
        <Player />
        <section className="nav-meta">
          <Link className="nav-meta-title" href="/about">
            About
          </Link>
        </section>
      </nav>
    </section>
  );
};

export default Nav;
