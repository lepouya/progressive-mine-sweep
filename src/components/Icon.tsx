import React from "react";
import icon, { cellIcon, CellIconProps, IconProps } from "../utils/icon";

export const Icon: React.FC<IconProps & { icon: string }> = (props) =>
  icon(props.icon)(props);
export const CellIcon: React.FC<CellIconProps> = (props) => cellIcon(props);

export default Icon;
