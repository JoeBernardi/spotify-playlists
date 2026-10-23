# Likes Song radio: plan (not started)

Date: 2026-10-23

Joe decided not to build this yet. This doc records the design for later.

Likes Song holds 2,106 liked tracks across 102 monthly Spotify playlists. The `/tracks` endpoint serves them whole, with Spotify ID, title, artists, album, cover URL, length, date liked and playlist URL. Spotify's 30-second previews no longer work, so there is no audio today.

The plan is a `/radio` page that plays liked songs in full through YouTube, like a music video channel.

## 1. What it looks like

- The YouTube player is the main stage, with cover art, title, artist, album and year beside it over a blurred cover.
- A year strip along the bottom (2013 to now) plays one year when clicked. A dropdown picks one month's playlist. Shuffle-all is the default.
- Controls: skip, back, pause, "wrong video" (next candidate) and "open in Spotify". Space and arrows work too. An "up next" column shows the queue.
- Shareable URLs: `/radio`, `/radio/2019`, `/radio/playlist/<id>`, and `?t=<trackId>` for one song.
- On a phone: one column, one tap to start.

## 2. How it works

- The client loads the catalog once, builds a queue, and asks `/radio/video/:spotifyTrackId` for each track, prefetching the next.
- The server answers from a JSON cache on the Fly volume, keyed by Spotify track ID. Each entry holds up to three candidate video IDs.
- On a cache miss, the server does one lookup and stores it. Tracks with no match are marked and skipped.
- Playback uses the YouTube IFrame Player API. On ENDED, the next video loads into the same player. The player stays visible, as YouTube's embed terms require.

## 3. Filling the Spotify-to-YouTube table

The backfill is a one-time job of 2,106 rows, and new likes add a few a month.

- **YouTube Data API search (official).**
  - Each search costs 100 of 10,000 daily quota units, shared with youtubecover.band: about 95 tracks a day, or three weeks.
  - Prefer results from YouTube's auto-generated "Topic" channels, which match more accurately.
  - Google's free quota increase form is usually approved for non-commercial apps. If it is, this route takes one night.
- **Odesli (song.link) API.**
  - It maps a Spotify ID to the YouTube video through the ISRC code, more accurate than name search, with no YouTube quota.
  - Keyless access was turned off in October 2026 (401 PUBLIC_API_ACCESS_DEPRECATED). A key is requested by email from developers@song.link.
  - The rate limit is unconfirmed. Historically about 10 requests a minute, so about four hours.
- **One-time local scrape with yt-dlp.**
  - A search run from Joe's Mac takes an hour or two, with no keys.
  - It goes against YouTube's terms for automated access. The practical risk from a home IP is low. This is Joe's call.
- **Lazy lookups plus a nightly job.**
  - Lookups happen as tracks play, and a nightly job spends leftover quota. It fills the catalog in about three weeks.

Recommended: send the quota form and the Odesli email now, build with lazy official lookups, and let whichever route arrives first fill the table.

## 4. Phone reality

- Chained autoplay works in the foreground after the first tap.
- YouTube embeds stop when the screen locks or the browser backgrounds, on iOS and Android alike. No media-session trick changes that, so a phone gets a screen-on jukebox, not pocket radio.
- Full-length background audio is not legally available from a web page without Spotify Premium's SDK, which does not run in mobile browsers.
- The fallback is 30-second previews from the Apple or Deezer search APIs, which play in the background but only for 30 seconds.

## 5. Other rough edges

- Visitors without YouTube Premium see ads.
- Some matches will be wrong, which is why "wrong video" exists.
- The YouTube key is shared with youtubecover.band.

## 6. Effort

- About two days of worker time: half a day for the matcher, cache and nightly job, a day for the page, and polish.
- A first slice takes about a day (shuffle only, lazy lookups, the page, auto-advance) and tests matches on the real catalog.

## 7. Open decisions for Joe

- Which backfill route to use.
- Whether to build the first slice.
- Whether a 30-second audio-only mode is worth it for phones.
