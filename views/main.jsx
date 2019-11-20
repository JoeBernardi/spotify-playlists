/* eslint import/first: 0 */

// Preact's new Debug thing requires it be a, uh, require
// in order for it to be conditionally imported.
// https://github.com/preactjs/preact/issues/1746

if (process.env.NODE_ENV === "development") {
	require("preact/debug"); // eslint-disable-line
}

import { render } from "preact";
import { Provider } from "unistore/preact";
import { Link, route } from "preact-router";

import AppRouter from "./router";
import createStore, { initialState } from "./store";

const app = document.getElementById("app");
const store = createStore(initialState);

render(
	<Provider store={store}>
		<div className="container">
			HELLO SEYMORUR
			<section className="section" style={{ paddingTop:0 }}>
				<AppRouter />
			</section>
		</div>
	</Provider>,
	app,
);
