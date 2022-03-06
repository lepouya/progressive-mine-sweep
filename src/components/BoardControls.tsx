import React, { ChangeEvent } from "react";
import { genHints, genPlayboard, Playboard } from "../model/Playboard";
import bind from "../utils/bind";
import clamp from "../utils/clamp";

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
  changeInput(event: InputEvent) {
    const target = event.target;

    if (target.validity.valid) {
      let num = parseInt(target.value);
      if (isNaN(num)) {
        num = 0;
      }

      if (target.name === "rows") {
        this.setState({ rows: num });
      } else if (target.name === "cols") {
        this.setState({ cols: num });
      } else if (target.name === "mines") {
        this.setState({ mines: num });
      }
    }
  }

  @bind
  resetBoard() {
    let { rows, cols, mines } = this.state;

    rows = clamp(rows, 3, 40);
    cols = clamp(cols, 3, 40);
    mines = clamp(mines, 0, 100);
    this.setState({ rows, cols, mines });

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
      <div className="board-controls panel">
        <div className="title-bar">Game parameters</div>
        <div className="half">
          <div className="half">Number of rows:</div>
          <div className="half">
            <input
              type="number"
              name="rows"
              min={0}
              max={40}
              value={this.state.rows}
              onInput={this.changeInput}
            />
          </div>
        </div>
        <div className="right half">
          <div className="half">
            <input
              type="button"
              value="Reset Board"
              onClick={this.resetBoard}
            />
          </div>
        </div>
        <div className="half">
          <div className="half">Number of columns:</div>
          <div className="half">
            <input
              type="number"
              name="cols"
              min={0}
              max={40}
              value={this.state.cols}
              onInput={this.changeInput}
            />
          </div>
        </div>
        <div className="right half">
          <div className="half">
            <input type="button" value="Get A Hint" onClick={this.getHint} />
          </div>
        </div>
        <div className="half">
          <div className="half">Mines density:</div>
          <div className="half">
            <input
              type="range"
              name="mines"
              min={1}
              max={99}
              value={this.state.mines}
              onInput={this.changeInput}
            />
          </div>
        </div>
      </div>
    );
  }
}
