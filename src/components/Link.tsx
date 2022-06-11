import { PropsWithChildren } from "react";
import { useLocation } from "react-router";
import { NavLink } from "react-router-dom";

export type LinkProps = PropsWithChildren<{
  to: string;
  condition?: boolean;
}>;

export default function Link(props: LinkProps) {
  if (props.condition != null && !props.condition) {
    return null;
  }

  const location = useLocation();
  let title = props.to.replace(/\W/g, "");
  if (title === "") {
    title = "main";
  }

  return (
    <div id={`tab-${title}`}>
      <NavLink
        className={({ isActive }) => (isActive ? "active" : "")}
        to={{ pathname: props.to, search: location.search }}
      >
        {props.children}
      </NavLink>
    </div>
  );
}
