import React, { ChangeEvent } from "react";
import { genHints, genPlayboard, Playboard } from "../model/Playboard";
import bind from "../utils/bind";

interface BoardControlsProps {
  board: Playboard;
  boardChanged?: (board: Playboard) => void;
}

interface BoardControlsState {
  rows: number;
  cols: number;
  mines: number;
}

export default class BoardControls extends React.Component<
  BoardControlsProps,
  BoardControlsState
> {
  constructor(props: BoardControlsProps) {
    super(props);
    this.state = { rows: 0, cols: 0, mines: 0 };
  }

  componentDidMount() {
    this.setInputs();
  }

  componentDidUpdate(prevProps: BoardControlsProps) {
    if (prevProps.board !== this.props.board) {
      this.setInputs();
    }
  }

  @bind
  setInputs() {
    let { board } = this.props;
    if (board.rows > 0 && board.cols > 0) {
      this.setState({
        rows: board.rows,
        cols: board.cols,
        mines: Math.floor((100 * board.numBombs) / (board.rows * board.cols)),
      });
    }
  }

  @bind
  changeInput(
    param: "rows" | "cols" | "mines",
    event: ChangeEvent<HTMLInputElement>,
  ) {
    if (event.target.validity.valid) {
      let num = parseInt(event.target.value);
      if (num < 0 || isNaN(num)) {
        num = 0;
      }
      if (param === "rows") {
        this.setState({ rows: num });
      } else if (param === "cols") {
        this.setState({ cols: num });
      } else if (param === "mines") {
        this.setState({ mines: num });
      }
    }
  }

  @bind
  resetBoard() {
    const { rows, cols, mines } = this.state;
    const board = genPlayboard(
      rows,
      cols,
      Math.floor((rows * cols * mines) / 100),
      Math.ceil((rows * cols * mines) / 100),
    );
    if (this.props.boardChanged) {
      this.props.boardChanged(board);
    }
  }

  @bind
  getHint() {
    genHints(this.props.board, 1, 0, 8, 1);

    if (this.props.boardChanged) {
      this.props.boardChanged(this.props.board);
    }
  }

  render() {
    return (
      <div
        className="boardcontrols"
        style={{
          border: "1px solid black",
          borderRadius: "5px",
          margin: "auto",
          maxWidth: "640px",
          padding: "5px",
          backgroundColor: "#eef8f8",
          boxSizing: "border-box",
        }}
      >
        <div>Game parameters:</div>
        <div>
          Number of rows:
          <input
            type="number"
            min={3}
            max={40}
            onInput={(e: ChangeEvent<HTMLInputElement>) =>
              this.changeInput("rows", e)
            }
            value={this.state.rows}
            style={{ width: "4em", marginLeft: "5px" }}
          />
        </div>
        <div>
          Number of columns:
          <input
            type="number"
            min={3}
            max={40}
            onInput={(e: ChangeEvent<HTMLInputElement>) =>
              this.changeInput("cols", e)
            }
            value={this.state.cols}
            style={{ width: "4em", marginLeft: "5px" }}
          />
        </div>
        <div>
          Mines density:
          <input
            type="range"
            min={1}
            max={99}
            onInput={(e: ChangeEvent<HTMLInputElement>) =>
              this.changeInput("mines", e)
            }
            value={this.state.mines}
            style={{ width: "10em", marginLeft: "5px" }}
          />
        </div>
        <div>
          <input type="button" value="Reset Board" onClick={this.resetBoard} />
        </div>
        <div>
          <input type="button" value="Get A Hint" onClick={this.getHint} />
        </div>
      </div>
    );
  }
}
