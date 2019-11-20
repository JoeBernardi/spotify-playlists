import path from "path";
import dotenv from "dotenv";
import express from "express";

import { authAndFetchPlaylists, getEnv } from "./helpers";

const app = express();
app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, "views")]);
app.use(express.static(path.join(__dirname, "/", "dist")));

app.get("/", async (req, res) => {
	const state = {};
	return res.render("templates/index", { state });
});

app.get("/playlists", async (req, res) => {
	try {
		const playlists = await authAndFetchPlaylists();
		return res.send(playlists);
	} catch (e) {
		throw Error(e);
	}
});


app.listen(getEnv().PORT, () => {
	console.log(`Listening on port ${getEnv().PORT}!`);
});
