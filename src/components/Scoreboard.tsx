import React from "react";

import { BoardState, Board, BoardCellCounts } from "../model/Board";

const Scoreboard: React.FC<{
  board: Board;
  cellCounts: BoardCellCounts;
  gameState: BoardState;
}> = ({ board, cellCounts, gameState }) => {
  return (
    <div className={"panel scoreboard-" + gameState}>
      <div className="left">
        <div>
          Board: {board.rows}x{board.cols}
        </div>
      </div>
      <div className="center">
        <div>
          {gameState === "won"
            ? "Minefield won!"
            : gameState === "lost"
            ? "Minefield lost!!"
            : gameState === "active"
            ? "Progress: " +
              Math.floor(
                (100 * cellCounts.revealed) /
                  (board.rows * board.cols - board.numMines),
              ) +
              "%"
            : ""}
        </div>
      </div>
      <div className="right">
        <div>
          Mines: {cellCounts.flagged}/{board.numMines}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
