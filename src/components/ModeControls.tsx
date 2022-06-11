import { useState } from "react";
import useGameContext from "./GameContext";
import Icon from "./Icon";

type Props = {
  showTapMode?: boolean;
  showBuyAmount?: boolean;
};

export default function ModeControls({
  showTapMode = true,
  showBuyAmount = true,
}: Props) {
  const { settings } = useGameContext();
  const [_tapMode, setTapMode] = useState(settings.tapMode);
  const [_buyAmount, setBuyAmount] = useState(settings.buyAmount);

  function toggleTapMode() {
    settings.tapMode = settings.tapMode === "reveal" ? "flag" : "reveal";
    setTapMode(settings.tapMode);
  }

  function setBuyMode(event: React.MouseEvent) {
    settings.buyAmount = (event.target as HTMLInputElement).value;
    setBuyAmount(settings.buyAmount);
  }

  function getClassName(buyMode: string) {
    return buyMode === settings.buyAmount ? "selected" : "unselected";
  }

  function renderButton(value: string, icon?: string, text?: string) {
    return (
      <button
        type="button"
        value={value}
        className={getClassName(value)}
        onClick={setBuyMode}
        id={`button-${value.replace(/\W/g, "")}`}
      >
        {icon && <Icon icon={icon} size="1em" />}
        {text}
      </button>
    );
  }

  return (
    <div className="panel mode-controls">
      {showTapMode && (
        <div className="left">
          <span>Tap mode:</span>
          <button
            type="button"
            value={settings.tapMode}
            onClick={toggleTapMode}
            id="button-tapmode"
          >
            <Icon
              state={settings.tapMode === "reveal" ? "revealed" : "flagged"}
              neighbors={9}
              size="1em"
            />
            {settings.tapMode === "reveal" ? "Revealing" : "Flagging"}
          </button>
        </div>
      )}
      <div className="spacer"></div>
      {showBuyAmount && (
        <div className="right">
          <span>Buy amount:</span>
          {renderButton("x1", "x", "1")}
          {renderButton("x5", "arrow-bar-to-right", "5")}
          {renderButton("+5", "x", "5")}
          {renderButton("x10", "arrow-bar-to-right", "10")}
          {renderButton("+10", "x", "10")}
          {renderButton("max", undefined, "MAX")}
        </div>
      )}
    </div>
  );
}
