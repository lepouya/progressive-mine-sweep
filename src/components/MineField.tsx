import React from "react";

import { Playboard, genPlayboard } from "../model/Playboard";
import bind from "../utils/bind";
import MineCell from "./MineCell";

interface MineFieldProps {
  width: number;
  height: number;

  minBombs?: number;
  maxBombs?: number;
}

interface MineFieldState {
  board: Playboard;
}

export default class MineField extends React.Component<
  MineFieldProps,
  MineFieldState
> {
  constructor(props: MineFieldProps) {
    super(props);
    this.state = { board: genPlayboard(0, 0) };
  }

  @bind
  makeBoard() {
    const { width, height, minBombs, maxBombs } = this.props;
    const board = genPlayboard(height, width, minBombs, maxBombs);
    this.setState({ board });
  }

  componentDidMount() {
    this.makeBoard();
  }

  componentDidUpdate(prevProps: MineFieldProps) {
    if (
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height ||
      prevProps.minBombs !== this.props.minBombs ||
      prevProps.maxBombs !== this.props.maxBombs
    ) {
      this.makeBoard();
    }
  }

  render() {
    const { board } = this.state;

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
