import React from "react";
import { useLocation } from "react-router";
import { NavLink } from "react-router-dom";

const Link: React.FC<React.PropsWithChildren<{ to: string }>> = ({
  to,
  children,
}) => {
  const location = useLocation();
  return (
    <NavLink
      className={({ isActive }) => (isActive ? "active" : "")}
      to={{ pathname: to, search: location.search }}
    >
      {children}
    </NavLink>
  );
};

export default Link;
