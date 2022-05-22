import React from "react";
import { Cell, CellState } from "../model/Cell";
import { default as cellIcons } from "../data/cell_icons.json";

export const Icon: React.FC<{
  icon: string;
  color?: string;
  size?: string;
  stroke?: string;
}> = (props) => {
  const parts = props.icon.split(/\s+/).filter((s) => s.trim().length > 0);
  const icon = parts.pop() ?? props.icon;
  const color = parts.pop() ?? props.color;
  const size = props.size ?? 24;
  const stroke = props.stroke ?? 2;

  return (
    <svg
      className={`icon icon-${icon}`}
      width={size}
      height={size}
      color={color}
      strokeWidth={stroke}
    >
      <use xlinkHref={`assets/tabler-sprite-nostroke.svg#tabler-${icon}`} />
    </svg>
  );
};

export const CellIcon: React.FC<{
  cell?: Cell;
  state?: CellState;
  neighbors?: number;
  color?: string;
  size?: string;
  stroke?: string;
}> = (props) => {
  let icon = cellIcons[props.cell?.state ?? props.state ?? "hidden"];
  if (icon instanceof Array) {
    icon = icon[props.cell?.neighbors ?? props.neighbors ?? 0];
  }
  if (!icon) {
    return null;
  }

  return (
    <Icon
      icon={icon}
      color={props.color}
      size={props.size}
      stroke={props.stroke}
    />
  );
};

export default Icon;
