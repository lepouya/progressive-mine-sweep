import React from "react";
import ReactDOM from "react-dom";
import MineField from "../components/MineField";

export default class Main extends React.Component {
  componentDidMount() {
    const domNode = ReactDOM.findDOMNode(this);
    if (domNode && domNode instanceof Element) {
      // TODO: Do something with the domNode if needed
    }
  }

  render() {
    return (
      <div>
        <MineField width={3} height={3} minBombs={1} />
        <MineField width={10} height={10} minBombs={3} maxBombs={7} />
        <MineField width={30} height={30} minBombs={100} />
      </div>
    );
  }
}
