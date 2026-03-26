import { usePlaylists } from "./hooks";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useEffect } from "react";

export const usePlaylistNav = (playlistIdFromProps?: string) => {
  const playlists = usePlaylists();
  const navigate = useNavigate();

  const playlistParams = useParams({
    from: "/playlist/$id",
    shouldThrow: false,
  });
  const currentPlaylistId = playlistParams?.id ?? playlistIdFromProps;

  const playlistNeighborIds = useMemo(() => {
    const allPlaylistIds = playlists.map((p) => p.id);
    const currentPlaylistIndex = allPlaylistIds.indexOf(
      currentPlaylistId as string,
    );

    if (currentPlaylistIndex === -1) return [];
    return [
      allPlaylistIds[currentPlaylistIndex + 1],
      allPlaylistIds[currentPlaylistIndex - 1],
    ];
  }, [playlists, currentPlaylistId]);

  const neighborCoverUrls = useMemo(() => {
    return playlistNeighborIds
      .map(
        (playlistId) =>
          playlistId && playlists.find((p) => p.id === playlistId)?.image,
      )
      .filter((url): url is string => !!url);
  }, [playlists, playlistNeighborIds]);

  // Preload the neighbor cover images if applicable
  useEffect(() => {
    const images = neighborCoverUrls.map((url) => {
      const img = new Image();
      img.src = url;
      return img;
    });
    return () => {
      for (const img of images) img.src = "";
    };
  }, [neighborCoverUrls]);

  const goToPlaylist = (targetId?: string) => {
    if (targetId) navigate({ to: `/playlist/${targetId}` });
  };

  const prevButtonDisabled = !playlistNeighborIds[0];
  const nextButtonDisabled = !playlistNeighborIds[1];

  return {
    playlistNeighborIds,
    goToPlaylist,
    prevButtonDisabled,
    nextButtonDisabled,
  };
};
