import Router from "preact-router";
import { connect } from "unistore/preact";

import App from "./pages/App";
import { actions } from "./store";

const appRouter = (props: any) => (
	<Router>
		<App
			path="/"
			getPlaylists={props.getPlaylists}
			playlists={props.playlists}
		/>
	</Router>
);

export default connect((props) => props, actions)(appRouter);
