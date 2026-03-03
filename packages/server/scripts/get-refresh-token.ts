/**
 * One-time script to obtain a Spotify refresh token via the Authorization Code flow.
 *
 * Usage:
 *   1. Set SPOTIFY_CLIENT_ID and SPOTIFY_SECRET in packages/server/.env
 *   2. Add https://127.0.0.1/callback as a Redirect URI in your Spotify app settings
 *   3. Run: bun packages/server/scripts/get-refresh-token.ts
 *   4. Open the URL printed in the terminal and authorize
 *   5. Your browser will redirect to a page that won't load — that's expected.
 *      Copy the full URL from your browser's address bar and paste it into the terminal.
 *   6. Add the printed SPOTIFY_REFRESH_TOKEN to your .env / Fly secrets
 */

import dotenv from "dotenv";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

dotenv.config({ path: resolve(import.meta.dirname, "../.env") });

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "Missing SPOTIFY_CLIENT_ID or SPOTIFY_SECRET in packages/server/.env",
  );
  process.exit(1);
}

const REDIRECT_URI = "https://127.0.0.1/callback";
const SCOPES = ["playlist-read-private", "playlist-read-collaborative"];

const authUrl = new URL("https://accounts.spotify.com/authorize");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("scope", SCOPES.join(" "));

console.log("\nOpen this URL in your browser:\n");
console.log(authUrl.toString());
console.log(
  "\nAfter authorizing, your browser will redirect to a page that won't load.",
);
console.log("Copy the full URL from your address bar and paste it here:\n");

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question("> ", async (input) => {
  rl.close();

  let redirectUrl: URL;
  try {
    redirectUrl = new URL(input.trim());
  } catch {
    console.error("Invalid URL");
    process.exit(1);
  }

  const error = redirectUrl.searchParams.get("error");
  if (error) {
    console.error("Authorization denied:", error);
    process.exit(1);
  }

  const code = redirectUrl.searchParams.get("code");
  if (!code) {
    console.error("No authorization code found in URL");
    process.exit(1);
  }

  const tokenResponse = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    },
  );

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    console.error("Token exchange failed:", tokenData);
    process.exit(1);
  }

  console.log("\nAdd this to your .env and Fly secrets:\n");
  console.log(`SPOTIFY_REFRESH_TOKEN=${tokenData.refresh_token}\n`);
});
