import React, { MouseEvent, useCallback } from "react";

import { actOnCell, Cell, CellAction } from "../model/Cell";
import cellIcons from "../utils/cellIcons";

const MineCell: React.FC<{
  cell: Cell;
  size: number;
  enabled: boolean;
  tapMode: CellAction;
  onAction: (cell: Cell) => void;
}> = ({ cell, size, enabled, tapMode, onAction }) => {
  const handleClick = useCallback(
    (event: MouseEvent<Element>) => {
      event.preventDefault();

      if (!enabled) {
        return;
      }
      // To flag: Right click
      //  On devices that don't have right click, hold any of the modifier keys and left click
      else if (
        event.button === 2 ||
        (event.button === 0 &&
          (event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            tapMode === "flag"))
      ) {
        actOnCell(cell, "flag");
        onAction(cell);
      }
      // To reveal: Left click
      else if (event.button === 0 && tapMode === "reveal") {
        actOnCell(cell, "reveal");
        onAction(cell);
      }
    },
    [cell, enabled, tapMode, onAction],
  );

  const minPx = Math.floor((640 * size) / 100);
  const cellSize = `min(${size}vmin, ${minPx}px)`;

  const color = cellIcons[cell.state].color;
  let icon = cellIcons[cell.state].icon;
  if (icon instanceof Array) {
    icon = icon[cell.neighbors];
  }

  return (
    <td
      className={"cell cell-" + cell.state}
      onClick={handleClick}
      onContextMenu={handleClick}
    >
      <div style={{ width: cellSize, height: cellSize }}>
        {icon ? icon({ color, size: "80%" }) : null}
      </div>
    </td>
  );
};

export default MineCell;
