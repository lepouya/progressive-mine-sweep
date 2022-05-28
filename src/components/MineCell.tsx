import { MouseEvent, useCallback } from "react";

import { genBoardState } from "../model/Board";
import { actOnCell, Cell, CellAction } from "../model/Cell";
import { scoreMultiplier, stateChanged } from "../model/GameFormulas";
import useGameContext from "./GameContext";
import Icon from "./Icon";

type Props = {
  cell: Cell;
  size: number;
  enabled: boolean;
  tapMode: CellAction;
};

export default function MineCell({ cell, size, enabled, tapMode }: Props) {
  const { context, board, setBoard, resources, settings } = useGameContext();

  const handleClick = useCallback(
    (event: MouseEvent<Element>) => {
      event.preventDefault();
      const clicks = resources.clicks;
      clicks.count++;

      if (!enabled) {
        clicks.extra.useless++;
        return;
      }

      const prevState = cell.state;

      // To flag: Right click
      //  On devices that don't have right click, hold any of the modifier keys
      //  and left click
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
        if (cell.state === "hidden") {
          const multiplier = scoreMultiplier(context);
          if (prevState === "flagged") {
            resources.flags.count -= multiplier;
            resources.flags.extra.unflags++;
          } else if (prevState === "revealed") {
            resources.cells.count -= multiplier;
            resources.cells.extra.hidden++;
          }
        }

        stateChanged(context, "cell", cell.state, false);

        if (board.state === "active") {
          let newBoard = genBoardState(board, settings.maxErrors);
          setBoard({ ...newBoard });
          if (newBoard.state !== "active") {
            stateChanged(context, "board", newBoard.state, false);
          }
        }
      }
    },
    [cell, enabled, tapMode],
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
        <Icon cell={cell} size="80%" />
      </div>
    </td>
  );
}
