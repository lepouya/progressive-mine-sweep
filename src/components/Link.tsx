import { PropsWithChildren } from "react";
import { useLocation } from "react-router";
import { NavLink } from "react-router-dom";

export type LinkProps = PropsWithChildren<{ to: string }>;

export default function Link(props: LinkProps) {
  const location = useLocation();
  return (
    <div>
      <NavLink
        className={({ isActive }) => (isActive ? "active" : "")}
        to={{ pathname: props.to, search: location.search }}
      >
        {props.children}
      </NavLink>
    </div>
  );
}
