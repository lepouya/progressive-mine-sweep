import { useMemo } from "react";

import MineCell from "./MineCell";
import clamp from "../utils/clamp";
import useGameContext from "./GameContext";

export default function MineField() {
  const {
    board,
    settings: { tapMode },
  } = useGameContext();

  const mineField = useMemo(
    function () {
      const estSize = Math.floor(95 / Math.max(board.rows, board.cols));
      const cellSize = clamp(estSize, 2, 30);
      return (
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
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    },
    [board, tapMode],
  );

  return <div className="minefield">{mineField}</div>;
}
