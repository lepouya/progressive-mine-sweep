import { MouseEvent, useCallback } from "react";

import { genBoardState, Board } from "../model/Board";
import { actOnCell, Cell } from "../model/Cell";
import useGameContext from "./GameContext";
import { stateChanged } from "../model/GameFormulas";
import Icon from "./Icon";

type Props = {
  board?: Board;
  cell: Cell;
  enabled?: boolean;

  boardWidth?: number;
  cellRatio: number;

  setBoard?: (board: Board) => void;
};

export default function MineCell(props: Props) {
  const context = useGameContext();
  const board = props.board ?? context.board;
  const cell = props.cell;
  const shouldCountStats = !props.board;

  const handleClick = useCallback(
    (event: MouseEvent<Element>) => {
      event.preventDefault();
      const clicks = context.resources.clicks;
      clicks.count++;

      if (!(props.enabled ?? true) || cell.locked) {
        if (shouldCountStats) {
          clicks.extra.useless++;
        }
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
            context.settings.tapMode === "flag"))
      ) {
        if (shouldCountStats) {
          clicks.extra.right++;
        }
        actOnCell(cell, "flag");
      }
      // To reveal: Left click
      else if (event.button === 0 && context.settings.tapMode === "reveal") {
        if (shouldCountStats) {
          clicks.extra.left++;
        }
        actOnCell(cell, "reveal");
      }

      if (prevState === cell.state) {
        if (shouldCountStats) {
          clicks.extra.useless++;
        }
      } else {
        if (shouldCountStats) {
          stateChanged(context, "cell", cell.state, false);
          if (cell.state === "hidden") {
            stateChanged(context, "cell", "un" + prevState, false);
          }
        }

        if (board.state === "active") {
          let newBoard = genBoardState(board, context.settings.maxErrors);
          (props.setBoard ?? context.setBoard)({ ...newBoard });
          if (newBoard.state !== "active") {
            if (shouldCountStats) {
              stateChanged(context, "board", newBoard.state, false);
            }
          }
        }
      }
    },
    [board, cell, props.enabled],
  );

  const minPx = Math.floor(((props.boardWidth ?? 640) * props.cellRatio) / 100);
  const cellSize = `min(${props.cellRatio}vmin, ${minPx}px)`;

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
