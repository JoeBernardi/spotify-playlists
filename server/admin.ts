import express from "express";
import basicAuth from "express-basic-auth";

import { cacheKey } from "./consts";
import { getEnv, playlistCache } from "./helpers";

getEnv();

const adminRouter = express.Router();

const authOptions = {
	users: { [process.env.ADMIN_USERNAME as string]: process.env.ADMIN_PASS as string },
	challenge: true,
	realm: "sadfasdfasdfasdf",
};

adminRouter.use(basicAuth(authOptions));

adminRouter.get("/cachebust", (_req, res) => {
	playlistCache.del(cacheKey);
	if (!playlistCache.get(cacheKey)) {
		res.send("Cache busted!");
	} else {
		res.send("Cache not busted somehow");
	}
});

export default adminRouter;
