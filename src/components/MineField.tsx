import React from "react";

import { Playboard } from "../model/Playboard";
import MineCell from "./MineCell";

interface MineFieldProps {
  board: Playboard;
}

interface MineFieldState {}

export default class MineField extends React.Component<
  MineFieldProps,
  MineFieldState
> {
  constructor(props: MineFieldProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { board } = this.props;

    const cellSize = Math.floor(
      Math.log2(640 / Math.max(board.rows, board.cols)),
    );
    const sizeClass =
      cellSize <= 4 ? "small" : cellSize > 6 ? "large" : "medium";

    return (
      <table className="minefield">
        <tbody>
          {board.cells.flatMap((row, r) => (
            <tr key={"row:" + r + ":*"}>
              {row.map((cell, c) => (
                <MineCell
                  key={"cell:" + r + ":" + c}
                  cell={cell}
                  size={sizeClass}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
