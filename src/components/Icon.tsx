import tablerIcons from "../../assets/tabler-sprite-nostroke.svg";
import cellIcons from "../data/cell_icons.json";
import { Cell, CellState } from "../model/Cell";
import { getHTMLElement } from "../utils/document";

export type IconProps = {
  icon?: string;

  color?: string;
  size?: string;

  cell?: Cell;
  state?: CellState;
  neighbors?: number;

  className?: string;
};

export default function Icon(props: IconProps) {
  const state = props.cell?.state ?? props.state;
  const neighbors = props.cell?.neighbors ?? props.neighbors;
  let icon = props.icon;

  if (!icon) {
    const cellIcon = cellIcons[state ?? "hidden"];
    if (cellIcon instanceof Array) {
      icon = cellIcon[neighbors ?? 0];
    } else if (cellIcon != null) {
      icon = cellIcon;
    } else {
      return null;
    }
  }

  const parts = icon.split(/\s+/).filter((s) => s.trim().length > 0);
  icon = parts.pop() ?? icon;
  let color = parts.pop() ?? props.color;

  const classNames = ["icon"];
  if (icon) {
    classNames.push("icon-" + icon);
  }
  if (state) {
    classNames.push("icon-" + state);
  }
  if (color && !color.startsWith("#")) {
    classNames.push(color);
    color = undefined;
  }
  if (props.className) {
    classNames.push(props.className);
  }

  return (
    <svg
      className={classNames.join(" ")}
      width={props.size}
      height={props.size}
      color={color}
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
