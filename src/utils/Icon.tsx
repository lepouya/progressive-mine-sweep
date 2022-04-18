import React, { SVGAttributes } from "react";
import { Cell, CellState } from "../model/Cell";

export const Icon: React.FC<IconProps & { icon: string }> = (props) => {
  const parts = props.icon.split(/\s+/).filter((s) => s.trim().length > 0);
  const partProps: Record<string, any> = {};
  const getPart = (name: string, finder: (value: string) => boolean) => {
    const found = parts.findIndex(finder);
    return found >= 0 ? (partProps[name] = parts.splice(found, 1)[0]) : null;
  };

  const icon = getPart("icon", (s) => getIcon(s) != null);
  getPart("size", (s) => !isNaN(parseFloat(s)));
  getPart("color", (s) => s.startsWith("#") || isNaN(parseFloat(s)));
  getPart("stroke", (s) => !isNaN(parseFloat(s)));

  return icon ? getIcon(icon)({ ...partProps, ...props }) : null;
};

export const CellIcon: React.FC<
  IconProps & {
    cell?: Cell;
    state?: CellState;
    neighbors?: number;
  }
> = (props) => {
  let icon = cellIcons[props.cell?.state ?? props.state ?? "hidden"];
  if (icon instanceof Array) {
    icon = icon[props.cell?.neighbors ?? props.neighbors ?? 0];
  }
  return Icon({ ...props, icon });
};

interface IconProps extends SVGAttributes<SVGElement> {
  color?: string;
  size?: string;
  stroke?: string;
}

const iconRegex = /(^icon)|([^0-9a-zA-Z]+)/gi;
declare global {
  var tablerIcons: Record<string, React.FC<IconProps>>;
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    for (const [name, icon] of Object.entries(global.tablerIcons)) {
      if (name.startsWith("Icon")) {
        global.tablerIcons[name.toLowerCase().replaceAll(iconRegex, "")] = icon;
      }
    }
  },
  false,
);

export const getIcon = (name: string) =>
  global.tablerIcons[name] ??
  global.tablerIcons[name.toLowerCase()] ??
  global.tablerIcons[name.toLowerCase().replaceAll(iconRegex, "")];

const cellIcons = {
  hidden: "transparent QuestionMark",
  hinted: "green Eye",
  flagged: "darkblue Flag2",
  blown: "red AlertTriangle",
  revealed: [
    "darkgreen SquareDot",
    "darkgreen Square1",
    "darkgreen Square2",
    "darkgreen Square3",
    "darkgreen Square4",
    "darkgreen Square5",
    "darkgreen Square6",
    "darkgreen Square7",
    "darkgreen Square8",
    "darkgreen Square",
  ],
};

export default Icon;
