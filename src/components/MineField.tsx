import React from "react";

import { Playboard } from "../model/Playboard";
import bind from "../utils/bind";
import GameSettings from "../utils/settings";
import MineCell from "./MineCell";

interface MineFieldProps {
  board: Playboard;
}

interface MineFieldState {
  cellSize: "small" | "medium" | "large";
}

export default class MineField extends React.Component<
  MineFieldProps,
  MineFieldState
> {
  constructor(props: MineFieldProps) {
    super(props);
    this.state = { cellSize: "medium" };
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
        GameSettings.ReferenceMineFieldSize / Math.max(board.rows, board.cols),
      ),
    );
    const cellSize = estSize <= 4 ? "small" : estSize > 6 ? "large" : "medium";

    this.setState({ cellSize });
  }

  render() {
    const { board } = this.props;
    const { cellSize } = this.state;

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
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
