import Link from "./Link";

interface NavItemProps {
  text: string;
  href: string;
  key?: string;
}

const NavItem = ({ text, href }: NavItemProps) => {
  return (
    <Link className="nav-item" href={href}>
      {text}
    </Link>
  );
};

export default NavItem;
