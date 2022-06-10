import { useEffect, useMemo, useState } from "react";

import MineCell from "./MineCell";
import useGameContext from "./GameContext";
import { Board, emptyBoard, genBoard, genBoardState } from "../model/Board";

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
  hints?: [number, number][];
  flags?: [number, number][];
  reveals?: [number, number][];
  blowns?: [number, number][];
  locks?: [number, number][];
  unlocks?: [number, number][];
  size?: number;
}) {
  const [board, setBoard] = useState(emptyBoard);

  useEffect(() => {
    const board = genBoard(props.rows, props.cols, props.randomMines);
    if (props.unlocks && props.unlocks.length > 0) {
      board.cells.forEach((r) => r.forEach((c) => (c.locked = true)));
    }

    props.mines?.forEach(([r, c]) => (board.cells[r][c].contents = "mine"));
    props.hints?.forEach(([r, c]) => (board.cells[r][c].state = "hinted"));
    props.flags?.forEach(([r, c]) => (board.cells[r][c].state = "flagged"));
    props.reveals?.forEach(([r, c]) => (board.cells[r][c].state = "revealed"));
    props.blowns?.forEach(([r, c]) => (board.cells[r][c].state = "blown"));
    props.locks?.forEach(([r, c]) => (board.cells[r][c].locked = true));
    props.unlocks?.forEach(([r, c]) => (board.cells[r][c].locked = false));

    setBoard(genBoardState(board));
  }, [props]);

  return (
    <MineField board={board} setBoard={setBoard} boardWidth={props.size} />
  );
}
