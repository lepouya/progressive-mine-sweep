import { useMemo } from "react";

import MineCell from "./MineCell";
import useGameContext from "./GameContext";
import { Board } from "../model/Board";

type Props = {
  board?: Board;
  setBoard?: (board: Board) => void;
  boardWidth?: number;
};

export default function MineField(props: Props) {
  const context = useGameContext();
  const board = props.board ?? context.board;

  const mineField = useMemo(
    function () {
      const cellRatio = Math.floor(95 / Math.max(board.rows, board.cols));
      return (
        <table>
          <tbody>
            {board.cells.flatMap((row, r) => (
              <tr key={`row:${r}:*`}>
                {row.map((cell, c) => (
                  <MineCell
                    key={`cell:${r}:${c}`}
                    cell={cell}
                    cellRatio={cellRatio}
                    enabled={board.state === "active"}
                    board={props.board}
                    setBoard={props.setBoard}
                    boardWidth={props.boardWidth}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    },
    [board],
  );

  return <div className="minefield">{mineField}</div>;
}
