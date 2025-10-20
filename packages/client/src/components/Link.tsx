import { Link as TanStackLink, useRouter } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";
interface LinkProps {
  href: string;
  className?: string;
  children?: React.ReactNode;
  goBackOnActive?: boolean;
}

const useIsSamePath = (href: string) => {
  const {
    location: { pathname },
  } = useRouterState();
  const isActive = href.split("/")[1] === pathname.split("/")[1];
  return isActive;
};

const Link = ({
  href,
  children,
  className,
  goBackOnActive = false,
}: LinkProps) => {
  const router = useRouter();
  const samePath = useIsSamePath(href);

  const handleClick = (e: React.MouseEvent) => {
    if (goBackOnActive && samePath) {
      e.preventDefault();
      router.history.back();
    }
  };

  return (
    <TanStackLink
      to={href}
      activeOptions={{ exact: true }}
      activeProps={{ className: "active" }}
      className={className}
      onClick={handleClick}
    >
      {children}
    </TanStackLink>
  );
};

export default Link;
