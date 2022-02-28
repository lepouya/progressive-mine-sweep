import React from "react";

import { Playboard, genPlayboard } from "../model/Playboard";
import bind from "../utils/bind";

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
    const cellStyle =
      cellSize <= 4
        ? "cell-small"
        : cellSize > 6
        ? "cell-large"
        : "cell-medium";

    let rows: JSX.Element[] = [];
    for (let r = 0; r < board.rows; r++) {
      let cols: JSX.Element[] = [];
      for (let c = 0; c < board.cols; c++) {
        const cell = board.cells[r][c];

        const bombStyle =
          cell.contents === "bomb"
            ? cell.state === "revealed"
              ? "bomb-blown"
              : "bomb-diffused"
            : "";

        cols[c] = (
          <td key={r + ":" + c} className={cellStyle + " " + bombStyle}>
            {cell.neighbors}
          </td>
        );
      }
      rows[r] = <tr key={r + ":*"}>{cols}</tr>;
    }

    return (
      <table className="minefield">
        <tbody>{rows}</tbody>
      </table>
    );
  }
}
