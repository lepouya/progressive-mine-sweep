import BuyButton from "../components/BuyButton";
import useGameContext from "../components/GameContext";
import Icon from "../components/Icon";
import ModeControls from "../components/ModeControls";
import ProgressBar from "../components/ProgressBar";
import ResourceBar from "../components/ResourceBar";
import ResourceRender from "../components/ResourceRender";
import ToggleButton from "../components/ToggleButton";
import { achievementAutomationDiscount } from "../model/GameAchievements";
import { getTickProgress } from "../model/GameAutomation";
import { Resource } from "../model/Resource";
import { formatTime } from "../utils/format";

export default function Automation() {
  const {
    context,
    resources: {
      revealNeighbors,
      autoRevealNeighbors,
      autoFlagMines,
      autoRevealHints,
      autoPurchaseHints,
      autoResetGame,
      autoClickBoard,
      autoBoardUpgrade,
    },
  } = useGameContext();

  const autoTime =
    context.settings.automationBaseSecs *
    achievementAutomationDiscount(context);
  const autoTimeStr = formatTime(1000 * autoTime);

  function tickProgress(res: Resource) {
    // Prevent flickering
    return !res.disabled && autoTime / res.value() <= 1
      ? 1
      : getTickProgress(res);
  }

  return (
    <div id="automation" className="automation">
      <ResourceBar />
      <ModeControls showTapMode={false} />

      <div className="game-controls panel">
        <div className="title-bar">Cell Automation</div>

        <div className="half">
          <ResourceRender
            resource={autoRevealNeighbors}
            showChrome={true}
            showLocked={true}
            infix=""
            suffix={`time${
              autoRevealNeighbors.count === 1 ? "" : "s"
            } every ${autoTimeStr}`}
          />
        </div>
        <div className="right half">
          <BuyButton
            resource={autoRevealNeighbors}
            allowUnlocking={true}
            enabled={revealNeighbors.unlocked && revealNeighbors.count > 0}
            prefix={!autoRevealNeighbors.unlocked ? "Unlock" : "Additional"}
          />
        </div>
        <div className="full right">
          Enabled:
          <ToggleButton
            checked={
              autoRevealNeighbors.unlocked && !autoRevealNeighbors.disabled
            }
            onChange={(checked) => (autoRevealNeighbors.disabled = !checked)}
            checkedContents={<Icon icon="robot" />}
            unCheckedContents={<Icon icon="robot-off" />}
            enabled={
              autoRevealNeighbors.unlocked && autoRevealNeighbors.count > 0
            }
          />
        </div>
        <ProgressBar
          value={tickProgress(autoRevealNeighbors)}
          className="full computed"
        >
          Automatically reveals the neighboring hidden squares if all the mines
          around it have been flagged.
        </ProgressBar>

        <hr className="separator" />

        <div className="half">
          <ResourceRender
            resource={autoFlagMines}
            showChrome={true}
            showLocked={true}
            infix=""
            suffix={`time${
              autoFlagMines.count === 1 ? "" : "s"
            } every ${autoTimeStr}`}
          />
        </div>
        <div className="right half">
          <BuyButton
            resource={autoFlagMines}
            allowUnlocking={true}
            enabled={
              autoRevealNeighbors.unlocked && autoRevealNeighbors.count > 0
            }
            prefix={!autoFlagMines.unlocked ? "Unlock" : "Additional"}
          />
        </div>
        <div className="full right">
          Enabled:
          <ToggleButton
            checked={autoFlagMines.unlocked && !autoFlagMines.disabled}
            onChange={(checked) => (autoFlagMines.disabled = !checked)}
            checkedContents={<Icon icon="robot" />}
            unCheckedContents={<Icon icon="robot-off" />}
            enabled={autoFlagMines.unlocked && autoFlagMines.count > 0}
          />
        </div>
        <ProgressBar
          value={tickProgress(autoFlagMines)}
          className="full computed"
        >
          Automatically flags the hidden mines around a square if there are no
          more hidden clear squares left around it.
        </ProgressBar>

        <hr className="separator" />

        <div className="half">
          <ResourceRender
            resource={autoRevealHints}
            showChrome={true}
            showLocked={true}
            infix=""
            suffix={`time${
              autoRevealHints.count === 1 ? "" : "s"
            } every ${autoTimeStr}`}
          />
        </div>
        <div className="right half">
          <BuyButton
            resource={autoRevealHints}
            allowUnlocking={true}
            prefix={!autoRevealHints.unlocked ? "Unlock" : "Additional"}
          />
        </div>
        <div className="full right">
          Enabled:
          <ToggleButton
            checked={autoRevealHints.unlocked && !autoRevealHints.disabled}
            onChange={(checked) => (autoRevealHints.disabled = !checked)}
            checkedContents={<Icon icon="robot" />}
            unCheckedContents={<Icon icon="robot-off" />}
            enabled={autoRevealHints.unlocked && autoRevealHints.count > 0}
          />
        </div>
        <ProgressBar
          value={tickProgress(autoRevealHints)}
          className="full computed"
        >
          Automatically reveals any purchased hints.
        </ProgressBar>

        <hr className="separator" />

        <div className="half">
          <ResourceRender
            resource={autoPurchaseHints}
            showChrome={true}
            showLocked={true}
            infix=""
            suffix={`time${
              autoPurchaseHints.count === 1 ? "" : "s"
            } every ${autoTimeStr}`}
          />
        </div>
        <div className="right half">
          <BuyButton
            resource={autoPurchaseHints}
            allowUnlocking={true}
            prefix={!autoPurchaseHints.unlocked ? "Unlock" : "Additional"}
          />
        </div>
        <div className="full right">
          Enabled:
          <ToggleButton
            checked={autoPurchaseHints.unlocked && !autoPurchaseHints.disabled}
            onChange={(checked) => (autoPurchaseHints.disabled = !checked)}
            checkedContents={<Icon icon="robot" />}
            unCheckedContents={<Icon icon="robot-off" />}
            enabled={autoPurchaseHints.unlocked && autoPurchaseHints.count > 0}
          />
        </div>
        <ProgressBar
          value={tickProgress(autoPurchaseHints)}
          className="full computed"
        >
          Automatically makes a hint purchase when there are no other actions
          available.
        </ProgressBar>
      </div>

      <div className="game-controls panel">
        <div className="title-bar">Game Automation</div>

        <div className="half">
          <ResourceRender
            resource={autoResetGame}
            showChrome={true}
            showLocked={true}
            infix=""
            suffix={`time${
              autoResetGame.count === 1 ? "" : "s"
            } every ${autoTimeStr}`}
          />
        </div>
        <div className="right half">
          <BuyButton
            resource={autoResetGame}
            allowUnlocking={true}
            prefix={!autoResetGame.unlocked ? "Unlock" : "Additional"}
          />
        </div>
        <div className="full right">
          Enabled:
          <ToggleButton
            checked={autoResetGame.unlocked && !autoResetGame.disabled}
            onChange={(checked) => (autoResetGame.disabled = !checked)}
            checkedContents={<Icon icon="robot" />}
            unCheckedContents={<Icon icon="robot-off" />}
            enabled={autoResetGame.unlocked && autoResetGame.count > 0}
          />
        </div>
        <ProgressBar
          value={tickProgress(autoResetGame)}
          className="full computed"
        >
          Automatically initiates game reset when the game is either won or
          lost.
        </ProgressBar>

        <hr className="separator" />

        <div className="half">
          <ResourceRender
            resource={autoClickBoard}
            showChrome={true}
            showLocked={true}
            infix=""
            suffix={`time${autoClickBoard.count === 1 ? "" : "s"} after reset`}
          />
        </div>
        <div className="right half">
          <BuyButton
            resource={autoClickBoard}
            allowUnlocking={true}
            prefix={!autoClickBoard.unlocked ? "Unlock" : "Additional"}
          />
        </div>
        <div className="full right">
          Enabled:
          <ToggleButton
            checked={autoClickBoard.unlocked && !autoClickBoard.disabled}
            onChange={(checked) => (autoClickBoard.disabled = !checked)}
            checkedContents={<Icon icon="robot" />}
            unCheckedContents={<Icon icon="robot-off" />}
            enabled={autoClickBoard.unlocked && autoClickBoard.count > 0}
          />
        </div>
        <div className="full computed">
          Automatically reveals cells on new games. Does not differentiate
          between mines and clear cells.
        </div>
      </div>

      <div className="game-controls panel">
        <div className="title-bar">Board Automation</div>

        <div className="half">
          <ResourceRender
            resource={autoBoardUpgrade}
            showChrome={true}
            showLocked={true}
            infix=""
            suffix={`time${
              autoBoardUpgrade.count === 1 ? "" : "s"
            } every ${autoTimeStr}`}
          />
        </div>
        <div className="right half">
          <BuyButton
            resource={autoBoardUpgrade}
            allowUnlocking={true}
            prefix={!autoBoardUpgrade.unlocked ? "Unlock" : "Additional"}
          />
        </div>
        <div className="full right">
          Enabled:
          <ToggleButton
            checked={autoBoardUpgrade.unlocked && !autoBoardUpgrade.disabled}
            onChange={(checked) => (autoBoardUpgrade.disabled = !checked)}
            checkedContents={<Icon icon="robot" />}
            unCheckedContents={<Icon icon="robot-off" />}
            enabled={autoBoardUpgrade.unlocked && autoBoardUpgrade.count > 0}
          />
        </div>
        <ProgressBar
          value={tickProgress(autoBoardUpgrade)}
          className="full computed"
        >
          Automatically purchases game width and game height expansions if
          affordable.
        </ProgressBar>
      </div>
    </div>
  );
}
