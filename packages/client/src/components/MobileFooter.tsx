import Link from "./Link";

import AboutIcon from "../assets/img/icons/about.svg?react";
import NavIcon from "../assets/img/icons/nav.svg?react";

const MobileFooter = () => {
  return (
    <section className="mobile-footer">
      <Link
        className="mobile-footer-button nav-link"
        href="/about"
        goBackOnActive
      >
        <AboutIcon />
      </Link>
      <Link
        className="mobile-footer-button nav-link"
        href="/nav"
        goBackOnActive
      >
        <NavIcon />
      </Link>
    </section>
  );
};

export default MobileFooter;
