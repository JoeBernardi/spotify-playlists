import { Link as TanStackLink } from "@tanstack/react-router";

interface LinkProps {
  href: string;
  className?: string;
  children?: React.ReactNode;
}

const Link = ({ href, children, className }: LinkProps) => {
  return (
    <TanStackLink
      to={href}
      activeOptions={{ exact: true }}
      activeProps={{ className: "active" }}
      className={className}
    >
      {children}
    </TanStackLink>
  );
};

export default Link;
