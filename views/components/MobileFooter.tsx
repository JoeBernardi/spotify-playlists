import { Link } from "preact-router/match";

import AboutIcon from "../img/icons/about.svg";
import NavIcon from "../img/icons/nav.svg";

const MobileFooter = () => {
	return (
		<section className="mobile-footer">
			<Link className="mobile-footer-button nav-link" activeClassName="active" href="/about"><AboutIcon /></Link>
			<Link className="mobile-footer-button nav-link" activeClassName="active" href="/nav"><NavIcon /></Link>
		</section>
	);
};

export default MobileFooter;
