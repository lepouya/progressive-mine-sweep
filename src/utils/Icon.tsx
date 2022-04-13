import React from "react";
import * as TI from "@tabler/icons";
import { Cell, CellState } from "../model/Cell";

export const Icon: React.FC<TI.TablerIconProps & { icon: string }> = (props) =>
  icons[props.icon](props);

export const CellIcon: React.FC<
  TI.TablerIconProps & { cell?: Cell; state?: CellState; neighbors?: number }
> = (props) => {
  const state = props.cell?.state ?? props.state ?? "hidden";
  const neighbors = props.cell?.neighbors ?? props.neighbors ?? 0;
  const color = cellIcons[state].color;
  let icon = cellIcons[state].icon;
  if (icon instanceof Array) {
    icon = icon[neighbors];
  }

  return icons[icon]({ color, ...props });
};

export const icons: Record<string, TI.TablerIcon> = {};
for (const [name, icon] of Object.entries(TI)) {
  icons[name] = icon;
  if (name.startsWith("Icon")) {
    icons[name.substring(4)] = icon;
  }
}

const cellIcons = {
  hidden: { color: "transparent", icon: "QuestionMark" },
  hinted: { color: "green", icon: "Eye" },
  flagged: { color: "darkblue", icon: "Flag2" },
  blown: { color: "red", icon: "AlertTriangle" },
  revealed: {
    color: "darkgreen",
    icon: [
      "SquareDot",
      "Square1",
      "Square2",
      "Square3",
      "Square4",
      "Square5",
      "Square6",
      "Square7",
      "Square8",
      "Square",
    ],
  },
};

export default Icon;
