import React from "react";

import { BoardState, Playboard, PlayboardCellCounts } from "../model/Playboard";

const Scoreboard: React.FC<{
  board: Playboard;
  cellCounts: PlayboardCellCounts;
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
