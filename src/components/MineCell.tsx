import React, { MouseEvent, useCallback } from "react";

import { actOnCell, Cell, CellAction } from "../model/Cell";
import { CellIcon } from "./Icon";
import useGameContext from "./GameContext";

const MineCell: React.FC<{
  cell: Cell;
  size: number;
  enabled: boolean;
  tapMode: CellAction;
  onAction: (cell: Cell) => void;
}> = ({ cell, size, enabled, tapMode, onAction }) => {
  const { resource } = useGameContext();

  const handleClick = useCallback(
    (event: MouseEvent<Element>) => {
      event.preventDefault();
      resource("clicks").count++;

      if (!enabled) {
        resource("clicks").extra.useless++;
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
        resource("clicks").extra.right++;
        actOnCell(cell, "flag");
      }
      // To reveal: Left click
      else if (event.button === 0 && tapMode === "reveal") {
        resource("clicks").extra.left++;
        actOnCell(cell, "reveal");
      }

      if (prevState === cell.state) {
        resource("clicks").extra.useless++;
      } else {
        switch (cell.state) {
          case "blown":
            resource("explosions").count++;
            resource("explosions").extra.manual++;
            break;

          case "hinted":
            resource("hints").count++;
            resource("hints").extra.manual++;
            break;

          case "flagged":
            resource("flags").count++;
            resource("flags").extra.manual++;
            break;

          case "revealed":
            resource("cells").count++;
            resource("cells").extra.manual++;
            break;

          case "hidden":
            if (prevState === "flagged") {
              resource("flags").count--;
              resource("flags").extra.unflags++;
            } else if (prevState === "revealed") {
              resource("cells").count--;
              resource("cells").extra.hidden++;
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
