import { useReplaceWithNewestPlaylist } from "../utils/redirect-newest";

/** Root not-found: unknown URLs → newest playlist (or home if listing empty). */
export default function NotFoundRedirect() {
  useReplaceWithNewestPlaylist(true);
  return null;
}
