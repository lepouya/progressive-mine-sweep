import React, { ChangeEvent } from "react";
import { genHints, genPlayboard, Playboard } from "../model/Playboard";
import bind from "../utils/bind";

type InputEvent = ChangeEvent<HTMLInputElement>;

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
        mines: Math.floor((100 * board.numMines) / (board.rows * board.cols)),
      });
    }
  }

  @bind
  changeInput(param: "rows" | "cols" | "mines", event: InputEvent) {
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
      <div className="board-controls">
        <div className="full-row title-bar">Game parameters</div>
        <div className="left-half">
          <div className="left-half">Number of rows:</div>
          <div className="left-half">
            <input
              type="number"
              min={3}
              max={40}
              value={this.state.rows}
              onInput={(e: InputEvent) => this.changeInput("rows", e)}
            />
          </div>
        </div>
        <div className="right-half">
          <div className="left-half">
            <input
              type="button"
              value="Reset Board"
              onClick={this.resetBoard}
            />
          </div>
        </div>
        <div className="left-half">
          <div className="left-half">Number of columns:</div>
          <div className="left-half">
            <input
              type="number"
              min={3}
              max={40}
              value={this.state.cols}
              onInput={(e: InputEvent) => this.changeInput("cols", e)}
            />
          </div>
        </div>
        <div className="right-half">
          <div className="left-half">
            <input type="button" value="Get A Hint" onClick={this.getHint} />
          </div>
        </div>
        <div className="left-half">
          <div className="left-half">Mines density:</div>
          <div className="left-half">
            <input
              type="range"
              min={1}
              max={99}
              value={this.state.mines}
              onInput={(e: InputEvent) => this.changeInput("mines", e)}
            />
          </div>
        </div>
      </div>
    );
  }
}
