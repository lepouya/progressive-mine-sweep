import React from "react";

import { actOnCell } from "../model/Cell";
import { countCells, Playboard, PlayboardCellCounts } from "../model/Playboard";
import bind from "../utils/bind";
import Settings from "../model/Settings";
import MineCell from "./MineCell";
import Scoreboard from "./Scoreboard";
import cellIcons from "../utils/cellIcons";
import clamp from "../utils/clamp";

interface MineFieldProps {
  board: Playboard;
}

interface MineFieldState {
  cellSize: number;
  cellCounts: PlayboardCellCounts;

  gameState: "inactive" | "active" | "won" | "lost";

  tapMode: "reveal" | "flag";
}

export default class MineField extends React.Component<
  MineFieldProps,
  MineFieldState
> {
  constructor(props: MineFieldProps) {
    super(props);
    this.state = {
      cellSize: 1,
      cellCounts: {
        hidden: 0,
        hinted: 0,
        flagged: 0,
        revealed: 0,
        blown: 0,
      },
      gameState: "inactive",
      tapMode: "reveal",
    };
  }

  componentDidMount() {
    this.setCellSize();
    this.determineOutcome();
  }

  componentDidUpdate(prevProps: MineFieldProps) {
    if (prevProps.board !== this.props.board) {
      this.setCellSize();
      this.determineOutcome();
    }
  }

  @bind
  setCellSize() {
    const { board } = this.props;

    const estSize = Math.floor(95 / Math.max(board.rows, board.cols));
    const cellSize = clamp(estSize, 2, 30);

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
      cellCounts["blown"] + cellCounts["flagged"] === board.numMines &&
      cellCounts["hidden"] === 0 &&
      cellCounts["revealed"] === board.cols * board.rows - board.numMines
    ) {
      // Won the game!
      this.setState({ gameState: "won" });
    } else {
      // Still in progress
      this.setState({ gameState: "active" });
    }
  }

  @bind
  toggleTapMode() {
    this.setState({
      tapMode: this.state.tapMode === "reveal" ? "flag" : "reveal",
    });
  }

  render() {
    const { board } = this.props;
    const { cellCounts, cellSize, gameState, tapMode } = this.state;

    const tapText = tapMode === "reveal" ? "Revealing" : "Flagging";
    const tapCell = cellIcons[tapMode === "reveal" ? "revealed" : "flagged"];
    const tapColor = tapCell.color;
    let tapIcon = tapCell.icon;
    if (tapIcon instanceof Array) {
      tapIcon = tapIcon[9];
    }

    return (
      <div className="minefield-chrome">
        <Scoreboard
          board={board}
          cellCounts={cellCounts}
          gameState={gameState}
        />
        <table className="minefield">
          <thead>
            <tr>
              <th colSpan={board.cols} className="cell">
                <button
                  type="button"
                  value={tapMode}
                  onClick={this.toggleTapMode}
                >
                  {"Tap mode: "}
                  {tapIcon ? tapIcon({ color: tapColor, size: "1em" }) : null}
                  {tapText}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {board.cells.flatMap((row, r) => (
              <tr key={"row:" + r + ":*"}>
                {row.map((cell, c) => (
                  <MineCell
                    key={"cell:" + r + ":" + c}
                    cell={cell}
                    size={cellSize}
                    enabled={gameState === "active"}
                    tapMode={tapMode}
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
