import React from "react";
import ReactDOM from "react-dom";

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
        <button className="cell"></button>
        <button className="cell bomb-diffused"></button>
        <button className="cell bomb-blown"></button>
      </div>
    );
  }
}
