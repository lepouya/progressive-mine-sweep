import { Cell, CellState } from "../model/Cell";
import getHTMLElement from "../utils/document";
import cellIcons from "../data/cell_icons.json";
import tablerIcons from "../../assets/tabler-sprite-nostroke.svg";

export type IconProps = {
  icon?: string;

  color?: string;
  size?: string;
  stroke?: string;

  cell?: Cell;
  state?: CellState;
  neighbors?: number;
};

export default function Icon(props: IconProps) {
  let icon = props.icon;
  if (!icon) {
    const cellIcon = cellIcons[props.cell?.state ?? props.state ?? "hidden"];
    if (cellIcon instanceof Array) {
      icon = cellIcon[props.cell?.neighbors ?? props.neighbors ?? 0];
    } else if (cellIcon != null) {
      icon = cellIcon;
    } else {
      return null;
    }
  }

  const parts = icon.split(/\s+/).filter((s) => s.trim().length > 0);
  icon = parts.pop() ?? icon;
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
      <use xlinkHref={`#tabler-${icon}`} />
    </svg>
  );
}

window.addEventListener(
  "load",
  () => (getHTMLElement("icon").innerHTML = tablerIcons),
  false,
);

/* Alternative method to dynamically load the svg:
webpack:
  output: { assetModuleFilename: "[name][ext]" }
  module: { rules: [{ test: /\.svg$/i, type: "asset/resource" }] }

ts:
  fetch(tablerIcons)
    .then((response) => response.text())
    .then((data) => (getHTMLElement("icon").innerHTML = data));
*/
