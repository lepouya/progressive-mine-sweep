import React from "react";

import { CellAction } from "../model/Cell";
import Icon, { CellIcon } from "./Icon";

const ModeControls: React.FC<{
  tapMode: CellAction;
  setTapMode: (tapMode: CellAction) => void;
  buyAmount: string;
  setBuyAmount: (amount: string) => void;
}> = ({ tapMode, setTapMode, buyAmount, setBuyAmount }) => {
  function toggleTapMode() {
    setTapMode(tapMode === "reveal" ? "flag" : "reveal");
  }

  function setBuyMode(event: React.MouseEvent) {
    setBuyAmount((event.target as HTMLInputElement).value);
  }

  function getClassName(buyMode: string) {
    return buyMode === buyAmount ? "selected" : "unselected";
  }

  return (
    <div className="panel mode-controls">
      <div className="left">
        <span>Tap mode:</span>
        <button type="button" value={tapMode} onClick={toggleTapMode}>
          <CellIcon
            state={tapMode === "reveal" ? "revealed" : "flagged"}
            neighbors={9}
            size="1em"
          />
          {tapMode === "reveal" ? "Revealing" : "Flagging"}
        </button>
      </div>
      <div className="right">
        <span>Buy amount:</span>
        <button
          type="button"
          value={"x1"}
          className={getClassName("x1")}
          onClick={setBuyMode}
        >
          <Icon icon="x" size="1em" />1
        </button>
        <button
          type="button"
          value={"x5"}
          className={getClassName("x5")}
          onClick={setBuyMode}
        >
          <Icon icon="arrow-bar-to-right" size="1em" />5
        </button>
        <button
          type="button"
          value={"+5"}
          className={getClassName("+5")}
          onClick={setBuyMode}
        >
          <Icon icon="x" size="1em" />5
        </button>
        <button
          type="button"
          value={"x10"}
          className={getClassName("x10")}
          onClick={setBuyMode}
        >
          <Icon icon="arrow-bar-to-right" size="1em" />
          10
        </button>
        <button
          type="button"
          value={"+10"}
          className={getClassName("+10")}
          onClick={setBuyMode}
        >
          <Icon icon="x" size="1em" />
          10
        </button>
        <button
          type="button"
          value={"max"}
          className={getClassName("max")}
          onClick={setBuyMode}
        >
          MAX
        </button>
      </div>
    </div>
  );
};

export default ModeControls;
