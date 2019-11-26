import bent from "bent";
import createStore from "unistore";
import devtools from "unistore/devtools";

const getJson = bent("GET", "json", `${process.env.PROTOCOL}${process.env.HOST}:${process.env.PORT}`, 200, 422, 500);

export const actions = () => ({
	getPlaylists: async (state: object): Promise<object> => {
		const playlists = await getJson("/playlists");

		return {
			...state,
			playlists
		};
	},
});

export const initialState = {
	playlists: [],
};

const storeExport = (state: object) => (process.env.NODE_ENV === "production"
	? createStore(state)
	: devtools(createStore(state)));

export default storeExport;
