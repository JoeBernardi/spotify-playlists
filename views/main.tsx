/* eslint import/first: 0 */

// Preact's new Debug thing requires it be a, uh, require
// in order for it to be conditionally imported.
// https://github.com/preactjs/preact/issues/1746

if (process.env.NODE_ENV === "development") {
	require("preact/debug"); // tslint:disable-line
}

import { render } from "preact";
import { Provider } from "unistore/preact";

import AppRouter from "./router";
import createStore, { initialState } from "./store";

const app = document.getElementById("app") as Element;
const store = createStore(initialState);

render(
	<Provider store={store}>
		<div className="container">
			HELLO SEYMORUR
			<div>
				<AppRouter />
			</div>
		</div>
	</Provider>,
	app,
);
