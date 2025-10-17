import { useEffect, useState, useRef, useMemo } from "react";
import { activeTrackIdAtom } from "../utils/store";
import { useAtom } from "jotai";
import { useTracks } from "../utils/hooks";

const Player = () => {
  const [activeTrackId, setActiveTrackId] = useAtom(activeTrackIdAtom);
  const tracks = useTracks();

  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeoutStart = 25000;

  const endSong = () => {
    setActiveTrackId("");
  };

  const track = useMemo(
    () => tracks.find((track) => track.id === activeTrackId),
    [tracks, activeTrackId]
  );

  useEffect(() => {
    if (!track) {
      return;
    }

    let fadeoutInterval: ReturnType<typeof setInterval>;
    setVolume(1);

    const fadeoutTimeout = setTimeout(() => {
      let newVolume = volume;

      fadeoutInterval = setInterval(() => {
        newVolume = newVolume - 0.05;
        if (newVolume <= 0) {
          setVolume(0);
          return clearInterval(fadeoutInterval);
        }

        setVolume(newVolume);
        if (audioRef.current) {
          audioRef.current.volume = newVolume;
        }
      }, fadeoutStart / 100);
    }, fadeoutStart);

    return () => {
      clearTimeout(fadeoutTimeout);
      clearInterval(fadeoutInterval);
    };
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!track) {
    return null;
  }

  return (
    <div className="nav-player">
      <audio
        ref={audioRef}
        src={track.preview_url ?? undefined}
        autoPlay
        onEnded={() => endSong()}
      />
    </div>
  );
};

export default Player;
