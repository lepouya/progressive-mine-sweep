import React from "react";
import BoardControls from "../components/BoardControls";
import MineField from "../components/MineField";
import { genPlayboard, Playboard } from "../model/Playboard";
import Settings from "../model/Settings";
import bind from "../utils/bind";

interface MainProps {}

interface MainState {
  board: Playboard;
}

export default class Main extends React.Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    this.state = { board: Settings.mainPlayboard };
  }

  componentDidMount() {
    if (this.state.board.rows === 0 || this.state.board.cols === 0) {
      this.boardChanged(genPlayboard(10, 10, 10));
    }
  }

  @bind
  boardChanged(board: Playboard) {
    Settings.mainPlayboard = board;
    this.setState({ board });
  }

  render() {
    return (
      <div>
        <MineField board={this.state.board} />
        <BoardControls
          board={this.state.board}
          boardChanged={this.boardChanged}
        />
      </div>
    );
  }
}
