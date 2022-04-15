import React from "react";
import * as TablerIcons from "@tabler/icons";
import { Cell, CellState } from "../model/Cell";

export const Icon: React.FC<TablerIcons.TablerIconProps & { icon: string }> = (
  props,
) => {
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
  TablerIcons.TablerIconProps & {
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

export const getIcon = (name: string) =>
  icons[name] ??
  icons[name.toLowerCase()] ??
  icons[name.toLowerCase().replace("icon", "")];

const icons: Record<string, TablerIcons.TablerIcon> = {};
for (const [name, icon] of Object.entries(TablerIcons)) {
  icons[name] = icon;
  icons[name.toLowerCase().replace("icon", "")] = icon;
}

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
