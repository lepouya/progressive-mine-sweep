import { useMemo, useState } from "react";

import MineCell from "./MineCell";
import useGameContext from "./GameContext";
import { Board, genBoard, genBoardState } from "../model/Board";

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

export function MineFieldWrapper(props: {
  rows: number;
  cols: number;
  randomMines?: number;
  mines?: [number, number][];
  size?: number;
}) {
  const [board, setBoard] = useState(() => {
    const board = genBoard(props.rows, props.cols, props.randomMines);
    (props.mines ?? []).forEach(
      ([row, col]) => (board.cells[row][col].contents = "mine"),
    );
    return genBoardState(board);
  });

  return (
    <MineField board={board} setBoard={setBoard} boardWidth={props.size} />
  );
}
