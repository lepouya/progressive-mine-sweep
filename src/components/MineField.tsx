import { useCallback } from "react";

import { CellAction } from "../model/Cell";
import { genBoardState } from "../model/Board";
import MineCell from "./MineCell";
import clamp from "../utils/clamp";
import useGameContext from "./GameContext";

type Props = {
  tapMode: CellAction;
};

export default function MineField({ tapMode }: Props) {
  const {
    board,
    setBoard,
    settings,
    resources: { losses, wins },
  } = useGameContext();

  const onAction = useCallback(() => {
    if (board.state !== "active") {
      return;
    }

    let newBoard = genBoardState(board, settings.maxErrors);
    setBoard({ ...newBoard });
    if (newBoard.state === "lost") {
      losses.count++;
      losses.extra.manual++;
    } else if (newBoard.state === "won") {
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
}
