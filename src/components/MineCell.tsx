import { MouseEvent, useCallback, useState } from "react";

import { Board, genBoardState } from "../model/Board";
import { actOnCell, Cell } from "../model/Cell";
import { revealNeighbors, stateChanged } from "../model/GameFormulas";
import clamp from "../utils/clamp";
import useGameContext from "./GameContext";
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
  const [_, setUselessClicks] = useState(0);
  const board = props.board ?? context.board;
  const cell = props.cell;
  const shouldCountStats = !props.board;

  const handleClick = useCallback(
    function (event: MouseEvent) {
      event.preventDefault();
      const clicks = context.resources.clicks;
      if (shouldCountStats) {
        clicks.count++;
      }

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
        (event.button === 2 && event.type === "contextmenu") ||
        (event.button === 0 &&
          event.type === "click" &&
          (context.settings.tapMode === "flag" ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey))
      ) {
        if (shouldCountStats) {
          clicks.extra.right++;
        }
        actOnCell(cell, "flag");
      }
      // To reveal: Left click
      else if (
        event.button === 0 &&
        event.type === "click" &&
        context.settings.tapMode === "reveal"
      ) {
        if (shouldCountStats) {
          clicks.extra.left++;
        }
        actOnCell(cell, "reveal");
      }
      // To auto-fill: Double click
      else if (event.button === 0 && event.type === "dblclick") {
        if (shouldCountStats) {
          clicks.extra.double++;
          setUselessClicks((uselessClicks) => {
            clicks.extra.useless -= clamp(uselessClicks, 0, 2);
            clicks.extra.left -= clamp(uselessClicks, 0, 2);
            return 0;
          });
        }

        if (!(context.resources.revealNeighbors.unlocked ?? true)) {
          if (shouldCountStats) {
            clicks.extra.useless++;
          }
        } else {
          revealNeighbors(
            context,
            board,
            cell,
            context.resources.revealNeighbors.count,
            shouldCountStats,
            false,
          );
        }
      }

      if (prevState === cell.state && event.type !== "dblclick") {
        setUselessClicks((uselessClicks) => uselessClicks + 1);
        if (shouldCountStats) {
          clicks.extra.useless++;
        }
      } else {
        setUselessClicks(0);
        if (shouldCountStats && prevState !== cell.state) {
          stateChanged(context, "cell", cell.state, false);
          if (cell.state === "hidden") {
            stateChanged(context, "cell", "un" + prevState, false);
          }
        }

        board.hadUserAction = true;
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
      onDoubleClick={handleClick}
      onContextMenu={handleClick}
      id={`col-${cell.col}`}
    >
      <div
        style={{ width: cellSize, height: cellSize }}
        id={`cell-${cell.row}-${cell.col}`}
      >
        <Icon cell={cell} />
      </div>
    </td>
  );
}
