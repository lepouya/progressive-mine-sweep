import * as Icons from "@tabler/icons";
import React, { MouseEvent } from "react";

import { actOnCell, Cell } from "../model/Cell";
import bind from "../utils/bind";

const cellIcons = {
  hidden: { color: "transparent", icon: Icons.IconQuestionMark },
  hinted: { color: "green", icon: Icons.IconEye },
  flagged: { color: "darkblue", icon: Icons.IconFlag2 },
  blown: { color: "red", icon: Icons.IconAlertTriangle },
  revealed: {
    color: "darkgreen",
    icon: [
      Icons.IconSquareDot,
      Icons.IconSquare1,
      Icons.IconSquare2,
      Icons.IconSquare3,
      Icons.IconSquare4,
      Icons.IconSquare5,
      Icons.IconSquare6,
      Icons.IconSquare7,
      Icons.IconSquare8,
    ],
  },
};

interface MineCellProps {
  cell: Cell;
  size: number;
  enabled: boolean;

  onAction?: (cell: Cell) => void;
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
    if (!this.props.enabled) {
      return;
    }

    // To flag: Right click
    //  On devices that don't have right click, hold any of the modifier keys and left click
    // TODO: What about mobile?
    if (
      event.button == 2 ||
      (event.button === 0 && (event.altKey || event.ctrlKey || event.metaKey))
    ) {
      actOnCell(this.props.cell, "flag");
      if (this.props.onAction) {
        this.props.onAction(this.props.cell);
      }
    }
    // To reveal: Left click
    // TODO: differentiate on mobile between a tap and flag
    else if (event.button === 0) {
      actOnCell(this.props.cell, "reveal");
      if (this.props.onAction) {
        this.props.onAction(this.props.cell);
      }
    }
  }

  render() {
    const { cell, size } = this.props;

    const minPx = Math.floor((640 * size) / 100);
    const cellSize = `min(${size}vmin, ${minPx}px)`;

    const color = cellIcons[cell.state].color;
    let icon = cellIcons[cell.state].icon;
    if (icon instanceof Array) {
      icon = icon[cell.neighbors];
    }

    return (
      <td
        className={"cell cell-" + cell.state}
        onClick={this.handleClick}
        onContextMenu={this.handleClick}
      >
        <div style={{ width: cellSize, height: cellSize }}>
          {icon ? icon({ color, size: "80%" }) : null}
        </div>
      </td>
    );
  }
}
