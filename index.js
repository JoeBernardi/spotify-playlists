import dotenv from "dotenv";

import { createApiInstance, getEnv, getPlaylists } from "./helpers";

const { SPOTIFY_USER } = getEnv();
const apiInstance = createApiInstance();

apiInstance.clientCredentialsGrant().then(async data => {
	const { access_token } = data.body;

	apiInstance.setAccessToken(access_token);

	try {
		const playlists = await getPlaylists(apiInstance, 0);
		console.log(playlists);		
	} catch (e) {
		console.log(e);
	}

});
