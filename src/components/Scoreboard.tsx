import React from "react";

import { Board } from "../model/Board";

const Scoreboard: React.FC<{
  board: Board;
}> = ({ board }) => {
  return (
    <div className={"panel scoreboard-" + board.state}>
      <div className="left">
        <div>
          Board: {board.rows}x{board.cols}
        </div>
      </div>
      <div className="center">
        <div>
          {board.state === "won"
            ? "Minefield won!"
            : board.state === "lost"
            ? "Minefield lost!!"
            : board.state === "active"
            ? "Progress: " +
              Math.floor(
                (100 * board.cellCounts.revealed) /
                  (board.rows * board.cols - board.numMines),
              ) +
              "%"
            : ""}
        </div>
      </div>
      <div className="right">
        <div>
          Mines: {board.cellCounts.flagged}/{board.numMines}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
