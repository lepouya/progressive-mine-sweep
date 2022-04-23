import { Cell, CellState } from "../model/Cell";

export default function icon(name: string) {
  const parts = name.split(/\s+/).filter((s) => s.trim().length > 0);
  const partProps: Record<string, any> = {};
  const getPart = (name: string, finder: (value: string) => boolean) => {
    const found = parts.findIndex(finder);
    return found >= 0 ? (partProps[name] = parts.splice(found, 1)[0]) : null;
  };

  const icon = getPart("icon", (s) => getIcon(s) != null);
  getPart("size", (s) => !isNaN(parseFloat(s)));
  getPart("color", (s) => s.startsWith("#") || isNaN(parseFloat(s)));
  getPart("stroke", (s) => !isNaN(parseFloat(s)));

  const resolved = icon ? getIcon(icon) : null;
  return resolved
    ? (props: Record<string, any>) => resolved({ ...partProps, ...props })
    : () => null;
}

export function cellIcon(props: CellIconProps) {
  let name = cellIcons[props.cell?.state ?? props.state ?? "hidden"];
  if (name instanceof Array) {
    name = name[props.cell?.neighbors ?? props.neighbors ?? 0];
  }
  return icon(name)(props);
}

export interface IconProps {
  color?: string;
  size?: string;
  stroke?: string;
}

export type CellIconProps = IconProps & {
  cell?: Cell;
  state?: CellState;
  neighbors?: number;
};

declare global {
  var tablerIcons: Record<string, (props: IconProps) => any>;
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

const getIcon = (name: string) =>
  global.tablerIcons[name] ??
  global.tablerIcons[name.toLowerCase()] ??
  global.tablerIcons[name.toLowerCase().replaceAll(iconRegex, "")];

const iconRegex = /(^icon)|([^0-9a-zA-Z]+)/gi;

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
