import React from "react";
import MineField from "../components/MineField";
import { Playboard, emptyBoard, genPlayboard } from "../model/Playboard";

interface MainProps {}

interface MainState {
  board1?: Playboard;
  board2?: Playboard;
  board3?: Playboard;
}

export default class Main extends React.Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    let { board1, board2, board3 } = this.state;

    if (board1 === undefined) {
      board1 = genPlayboard(3, 3, 1);
      this.setState({ board1 });
    }

    if (board2 === undefined) {
      board2 = genPlayboard(10, 10, 3, 7);
      this.setState({ board2 });
    }

    if (board3 === undefined) {
      board3 = genPlayboard(30, 30, 100);
      this.setState({ board3 });
    }
  }

  render() {
    let { board1, board2, board3 } = this.state;
    return (
      <div>
        <MineField board={board1 ?? emptyBoard} />
        <MineField board={board2 ?? emptyBoard} />
        <MineField board={board3 ?? emptyBoard} />
      </div>
    );
  }
}
