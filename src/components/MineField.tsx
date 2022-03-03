import React from "react";
import { actOnCell } from "../model/Cell";

import { countCells, Playboard } from "../model/Playboard";
import bind from "../utils/bind";
import Settings from "../model/Settings";
import MineCell from "./MineCell";

interface MineFieldProps {
  board: Playboard;
}

interface MineFieldState {
  cellSize: "small" | "medium" | "large";
  playable: boolean;
}

export default class MineField extends React.Component<
  MineFieldProps,
  MineFieldState
> {
  constructor(props: MineFieldProps) {
    super(props);
    this.state = { cellSize: "medium", playable: false };
  }

  componentDidMount() {
    this.setCellSize();
  }

  componentDidUpdate(prevProps: MineFieldProps) {
    if (
      prevProps.board.rows !== this.props.board.rows ||
      prevProps.board.cols !== this.props.board.cols
    ) {
      this.setCellSize();
    }
  }

  @bind
  setCellSize() {
    const { board } = this.props;

    const estSize = Math.floor(
      Math.log2(
        Settings.ReferenceMineFieldSize / Math.max(board.rows, board.cols),
      ),
    );
    const cellSize = estSize <= 4 ? "small" : estSize > 6 ? "large" : "medium";

    this.setState({ cellSize });
    this.determineOutcome();
  }

  @bind
  determineOutcome() {
    const { board } = this.props;
    const counts = countCells(board);

    if (counts["blown"] >= Settings.maxErrors) {
      // Lost the game!
      board.cells.forEach((cells) =>
        cells.forEach((cell) => actOnCell(cell, "reveal")),
      );
      this.setState({ playable: false });
      alert("Aw lost!");
    } else if (
      board.cols * board.rows > 0 &&
      counts["blown"] + counts["flagged"] === board.numBombs &&
      counts["hidden"] === 0 &&
      counts["revealed"] === board.cols * board.rows - board.numBombs
    ) {
      // Won the game!
      this.setState({ playable: false });
      alert("Yes! you win");
    } else {
      // Still in progress
      this.setState({ playable: true });
    }
  }

  render() {
    const { board } = this.props;
    const { cellSize, playable } = this.state;

    return (
      <table className="minefield">
        <tbody>
          {board.cells.flatMap((row, r) => (
            <tr key={"row:" + r + ":*"}>
              {row.map((cell, c) => (
                <MineCell
                  key={"cell:" + r + ":" + c}
                  cell={cell}
                  size={cellSize}
                  enabled={playable}
                  onAction={this.determineOutcome}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
