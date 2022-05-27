import React, { useCallback } from "react";

import { CellAction } from "../model/Cell";
import { Board, genBoardState } from "../model/Board";
import MineCell from "./MineCell";
import clamp from "../utils/clamp";
import useGameContext, { useResources } from "./GameContext";

const MineField: React.FC<{
  board: Board;
  setBoard: (board: Board) => void;
  tapMode: CellAction;
}> = ({ board, setBoard, tapMode }) => {
  const { settings } = useGameContext();
  const { losses, wins } = useResources();

  const onAction = useCallback(() => {
    if (board.state !== "active") {
      return;
    }

    board = genBoardState(board, settings.maxErrors);
    setBoard({ ...board });
    if (board.state === "lost") {
      losses.count++;
      losses.extra.manual++;
    } else if (board.state === "won") {
      wins.count++;
      wins.extra.manual++;
    }
  }, [board]);

  const estSize = Math.floor(95 / Math.max(board.rows, board.cols));
  const cellSize = clamp(estSize, 2, 30);

  return (
    <div className="minefield">
      <table>
        <tbody>
          {board.cells.flatMap((row, r) => (
            <tr key={`row:${r}:*`}>
              {row.map((cell, c) => (
                <MineCell
                  key={`cell:${r}:${c}`}
                  cell={cell}
                  size={cellSize}
                  enabled={board.state === "active"}
                  tapMode={tapMode}
                  onAction={onAction}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MineField;
