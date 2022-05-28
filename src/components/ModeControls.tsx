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
  function toggleTapMode() {
    settings.tapMode = settings.tapMode === "reveal" ? "flag" : "reveal";
  }

  function setBuyMode(event: React.MouseEvent) {
    settings.buyAmount = (event.target as HTMLInputElement).value;
  }

  function getClassName(buyMode: string) {
    return buyMode === settings.buyAmount ? "selected" : "unselected";
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
      )}
    </div>
  );
}
