import React, { MouseEvent, useCallback } from "react";

import { actOnCell, Cell, CellAction } from "../model/Cell";
import { CellIcon } from "./Icon";
import { useResources } from "./GameContext";

const MineCell: React.FC<{
  cell: Cell;
  size: number;
  enabled: boolean;
  tapMode: CellAction;
  onAction: (cell: Cell) => void;
}> = ({ cell, size, enabled, tapMode, onAction }) => {
  const { clicks, cells, flags, hints, explosions } = useResources();

  const handleClick = useCallback(
    (event: MouseEvent<Element>) => {
      event.preventDefault();
      clicks.count++;

      if (!enabled) {
        clicks.extra.useless++;
        return;
      }

      const prevState = cell.state;

      // To flag: Right click
      //  On devices that don't have right click, hold any of the modifier keys and left click
      if (
        event.button === 2 ||
        (event.button === 0 &&
          (event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            tapMode === "flag"))
      ) {
        clicks.extra.right++;
        actOnCell(cell, "flag");
      }
      // To reveal: Left click
      else if (event.button === 0 && tapMode === "reveal") {
        clicks.extra.left++;
        actOnCell(cell, "reveal");
      }

      if (prevState === cell.state) {
        clicks.extra.useless++;
      } else {
        switch (cell.state) {
          case "blown":
            explosions.count++;
            explosions.extra.manual++;
            break;

          case "hinted":
            hints.count++;
            hints.extra.manual++;
            break;

          case "flagged":
            flags.count++;
            flags.extra.manual++;
            break;

          case "revealed":
            cells.count++;
            cells.extra.manual++;
            break;

          case "hidden":
            if (prevState === "flagged") {
              flags.count--;
              flags.extra.unflags++;
            } else if (prevState === "revealed") {
              cells.count--;
              cells.extra.hidden++;
            }
            break;
        }

        onAction(cell);
      }
    },
    [cell, enabled, tapMode, onAction],
  );

  const minPx = Math.floor((640 * size) / 100);
  const cellSize = `min(${size}vmin, ${minPx}px)`;

  return (
    <td
      className={`cell cell-${cell.state}`}
      onClick={handleClick}
      onContextMenu={handleClick}
    >
      <div style={{ width: cellSize, height: cellSize }}>
        <CellIcon cell={cell} size="80%" />
      </div>
    </td>
  );
};

export default MineCell;
