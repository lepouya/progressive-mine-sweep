import React from "react";

import { Cell } from "../model/Cell";

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

  render() {
    const { cell, size } = this.props;

    const cellStyle = "cell-" + size;
    const bombStyle =
      cell.contents === "bomb"
        ? cell.state === "revealed"
          ? "bomb-blown"
          : "bomb-diffused"
        : "";

    return <td className={cellStyle + " " + bombStyle}>{cell.neighbors}</td>;
  }
}
