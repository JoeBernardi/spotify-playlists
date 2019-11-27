import { Link } from "preact-router/match";

interface NavItemProps {
	text: string;
	href: string;
}

const NavItem = ({ text, href }: NavItemProps) => {
	return (
		<Link activeClassName="active" className="nav-item" href={href}>{text}</Link>
	);
};

export default NavItem;
