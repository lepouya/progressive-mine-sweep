import React from "react";

import { actOnCell } from "../model/Cell";
import { countCells, Playboard, PlayboardCellCounts } from "../model/Playboard";
import bind from "../utils/bind";
import Settings from "../model/Settings";
import MineCell from "./MineCell";

interface MineFieldProps {
  board: Playboard;
}

interface MineFieldState {
  cellSize: number;
  cellCounts: PlayboardCellCounts;

  gameState: "inactive" | "active" | "won" | "lost";
}

export default class MineField extends React.Component<
  MineFieldProps,
  MineFieldState
> {
  constructor(props: MineFieldProps) {
    super(props);
    this.state = {
      cellSize: 0,
      cellCounts: {
        hidden: 0,
        hinted: 0,
        flagged: 0,
        revealed: 0,
        blown: 0,
      },
      gameState: "inactive",
    };
  }

  componentDidMount() {
    this.setCellSize();
    this.determineOutcome();
  }

  componentDidUpdate(prevProps: MineFieldProps) {
    if (
      prevProps.board.rows !== this.props.board.rows ||
      prevProps.board.cols !== this.props.board.cols
    ) {
      this.setCellSize();
      this.determineOutcome();
    }
  }

  @bind
  setCellSize() {
    const { board } = this.props;

    const estSize = Math.floor(
      Math.log2(
        Settings.ReferenceMineFieldSize /
          (1 + Math.max(board.rows, board.cols)),
      ),
    );
    const cellSize = Math.pow(2, Math.max(4, Math.min(6, estSize)));

    this.setState({ cellSize });
  }

  @bind
  determineOutcome() {
    const { board } = this.props;
    const cellCounts = countCells(board);
    this.setState({ cellCounts });

    if (board.cols * board.rows === 0) {
      // Unplayable board
      this.setState({ gameState: "inactive" });
    } else if (cellCounts["blown"] >= Settings.maxErrors) {
      // Lost the game!
      this.setState({ gameState: "lost" });

      board.cells.forEach((cells) =>
        cells.forEach((cell) => actOnCell(cell, "reveal")),
      );
    } else if (
      cellCounts["blown"] + cellCounts["flagged"] === board.numBombs &&
      cellCounts["hidden"] === 0 &&
      cellCounts["revealed"] === board.cols * board.rows - board.numBombs
    ) {
      // Won the game!
      this.setState({ gameState: "won" });
    } else {
      // Still in progress
      this.setState({ gameState: "active" });
    }
  }

  render() {
    const { board } = this.props;
    const { cellCounts, cellSize, gameState } = this.state;

    return (
      <div className="minefield-chrome">
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
        <table className="minefield">
          <tbody>
            {board.cells.flatMap((row, r) => (
              <tr key={"row:" + r + ":*"}>
                {row.map((cell, c) => (
                  <MineCell
                    key={"cell:" + r + ":" + c}
                    cell={cell}
                    size={cellSize}
                    enabled={gameState === "active"}
                    onAction={this.determineOutcome}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
