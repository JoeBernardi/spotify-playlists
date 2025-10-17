import type { Playlist } from "@spotify-playlists/shared";
import NavItem from "./NavItem";
import PlusIcon from "../assets/img/icons/plus.svg?react";
import MinusIcon from "../assets/img/icons/minus.svg?react";

interface PlayListByYearProps {
  year: string;
  playlists: Playlist[];
  isActive: boolean;
  toggleYear: (year: string) => void;
}

const NavYear = ({
  year,
  playlists,
  isActive,
  toggleYear,
}: PlayListByYearProps) => {
  const playlistsThisYear = playlists.map((playlist) => (
    <NavItem
      key={playlist.id}
      href={`/playlist/${playlist.id}`}
      text={playlist.month}
    />
  ));

  let yearClasses = "nav-playlists-year";
  let iconComponent = <PlusIcon />;

  if (isActive) {
    yearClasses += " active";
    iconComponent = <MinusIcon />;
  }

  return (
    <div className={yearClasses}>
      <div
        className="nav-playlists-year-header"
        onClick={() => toggleYear(year)}
      >
        <h3 className="nav-playlists-year-header-title">{year}</h3>
        <div className="nav-playlists-year-header-icon">{iconComponent}</div>
      </div>
      <div className="nav-playlists-year-playlists">{playlistsThisYear}</div>
    </div>
  );
};

export default NavYear;
