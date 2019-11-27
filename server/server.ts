import express from "express";
import path from "path";

import { authAndFetchPlaylists, getEnv } from "./helpers";

const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/")));

app.get("/playlists", async (_req, res) => {
	try {
		const playlists = await authAndFetchPlaylists();
		return res.send(playlists);
	} catch (e) {
		throw Error(e);
	}
});

app.get("*", async (_req, res) => {
	const state = {};
	return res.render("templates/index", { state });
});

app.listen(getEnv().PORT, () => {
	console.log(`Listening on port ${getEnv().PORT}!`);
});

process.on("SIGINT", () => {
    console.log("Terminating...");
    process.exit(0);
});
