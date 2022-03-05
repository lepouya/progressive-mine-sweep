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
      <div className={"scoreboard scoreboard-" + gameState}>
        <div className="scoreboard-segment scoreboard-left">
          <div>
            Board: {board.rows}x{board.cols}
          </div>
        </div>
        <div className="scoreboard-segment scoreboard-center">
          <div>
            {gameState === "won"
              ? "Minefield swept clean!"
              : gameState === "lost"
              ? "Minefield lost!!"
              : gameState === "active"
              ? "Progress: " +
                Math.floor(
                  (100 *
                    (cellCounts.revealed +
                      cellCounts.flagged +
                      cellCounts.blown)) /
                    board.rows /
                    board.cols,
                ) +
                "%"
              : ""}
          </div>
        </div>
        <div className="scoreboard-segment scoreboard-right">
          <div>
            Mines: {cellCounts.flagged}/{board.numBombs}
          </div>
        </div>
      </div>
    );
  }
}
