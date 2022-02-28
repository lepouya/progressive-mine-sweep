import React from "react";

import bind from "../utils/bind";

interface MineFieldProps {
  width: number;
  height: number;
}

interface MineFieldState {
  width: number;
  height: number;
  board: number[][];
}

const styles = ["", "bomb-diffused", "bomb-blown"];

export default class MineField extends React.Component<
  MineFieldProps,
  MineFieldState
> {
  constructor(props: MineFieldProps) {
    super(props);
    this.state = { width: 0, height: 0, board: [] };
  }

  @bind
  makeBoard() {
    const { width, height } = this.props;
    const board: number[][] = [];

    for (let r = 0; r < height; r++) {
      board[r] = [];

      for (let c = 0; c < width; c++) {
        const style = Math.floor(Math.random() * styles.length);
        board[r][c] = style;
      }
    }

    this.setState({ width, height, board });
  }

  componentDidMount() {
    this.makeBoard();
  }

  componentDidUpdate(prevProps: MineFieldProps) {
    if (
      prevProps.width != this.props.width ||
      prevProps.height != this.props.height
    ) {
      this.makeBoard();
    }
  }

  render() {
    const { width, height, board } = this.state;

    const cellSize = Math.floor(Math.log2(640 / Math.max(width, height)));
    const cellStyle =
      cellSize <= 4
        ? "cell-small"
        : cellSize > 6
        ? "cell-large"
        : "cell-medium";

    let rows: JSX.Element[] = [];
    for (let r = 0; r < height; r++) {
      let cols: JSX.Element[] = [];
      for (let c = 0; c < width; c++) {
        const style = styles[board[r][c]];

        cols[c] = (
          <td key={r + ":" + c} className={cellStyle + " " + style}>
            {(r + c) % 10}
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
