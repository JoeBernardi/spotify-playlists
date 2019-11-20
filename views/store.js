import createStore from "unistore";
import devtools from "unistore/devtools";
import bent from "bent";

const getJson = bent("GET", "json", `${process.env.PROTOCOL}${process.env.HOST}:${process.env.PORT}`, 200, 422, 500);

export const actions = () => ({
	getPlaylists: async (state) => {
		console.log("beat");
		const testo = await getJson("/playlists");
		console.log(testo);
		console.log("incesto");
		return {
			...state,
		}
	},
});

export const initialState = {
	playlists: [],
}

const storeExport = (initialState) => (process.env.NODE_ENV === "production"
	? createStore(initialState)
	: devtools(createStore(initialState)));

export default storeExport;
