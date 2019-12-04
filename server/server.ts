import express from "express";
import path from "path";

import { authAndFetchPlaylists, getEnv } from "./helpers";

getEnv();

const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/")));

app.get("/playlists", async (_req, res) => {
		const playlists = await authAndFetchPlaylists()
			.catch((e: Error) => Promise.reject(e));

		return res.send(playlists);
});

app.get("*", async (_req, res) => {
	const state = {};
	return res.render("templates/index", { state });
});

app.listen(process.env.PORT, () => {
	console.log(`Listening on port ${process.env.PORT}!`);
});

process.on("SIGINT", () => {
    console.log("Terminating...");
    process.exit(0);
});
