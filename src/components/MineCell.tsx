import React, { MouseEvent } from "react";

import { actOnCell, Cell } from "../model/Cell";
import bind from "../utils/bind";

interface MineCellProps {
  cell: Cell;
  size: "small" | "medium" | "large";
}

interface MineCellState {}

export default class MineCell extends React.Component<
  MineCellProps,
  MineCellState
> {
  constructor(props: MineCellProps) {
    super(props);
    this.state = {};
  }

  @bind
  handleClick(event: MouseEvent<Element>) {
    event.preventDefault();

    // To flag: Right click
    //  On devices that don't have right click, hold any of the modifier keys and left click
    // TODO: What about mobile?
    if (
      event.button == 2 ||
      (event.button === 0 && (event.altKey || event.ctrlKey || event.metaKey))
    ) {
      actOnCell(this.props.cell, "flag");
    }
    // To revelar: Left click
    // TODO: differentiate on mobile between a tap and flag
    else if (event.button === 0) {
      actOnCell(this.props.cell, "reveal");
    }
  }

  render() {
    const { cell, size } = this.props;

    const cellSize = "cell-" + size;
    const cellState = "cell-" + cell.state;

    // TODO: find out how to make the text not adjust the height of cells
    return (
      <td
        className={cellSize + " " + cellState}
        onClick={this.handleClick}
        onContextMenu={this.handleClick}
      >
        {cell.state === "revealed" && cell.neighbors > 0
          ? cell.neighbors
          : "\u00a0"}
      </td>
    );
  }
}
