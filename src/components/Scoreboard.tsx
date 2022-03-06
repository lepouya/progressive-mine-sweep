import React from "react";

import { Playboard, PlayboardCellCounts } from "../model/Playboard";

interface ScoreboardProps {
  board: Playboard;
  cellCounts: PlayboardCellCounts;
  gameState: "inactive" | "active" | "won" | "lost";
}

interface ScoreboardState {}

export default class Scoreboard extends React.Component<
  ScoreboardProps,
  ScoreboardState
> {
  constructor(props: ScoreboardProps) {
    super(props);
  }

  render() {
    const { board, cellCounts, gameState } = this.props;

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
  }
}
