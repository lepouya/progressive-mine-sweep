import BuyButton from "../components/BuyButton";
import useGameContext from "../components/GameContext";
import ModeControls from "../components/ModeControls";
import ResourceBar from "../components/ResourceBar";
import ResourceRender from "../components/ResourceRender";

export default function Automation() {
  const {
    resources: { revealNeighbors },
  } = useGameContext();

  return (
    <div id="automation">
      <ResourceBar />
      <ModeControls showTapMode={false} />

      <div className="game-controls panel">
        <div className="title-bar">Cell Automation</div>
        <div className="half">
          <ResourceRender
            resource={revealNeighbors}
            showChrome={true}
            infix=""
            placeholder="Nothing happens"
            suffix="on double-tap"
            className="value-first"
          />
        </div>
        <div className="right half">
          <BuyButton
            resource={revealNeighbors}
            allowUnlocking={true}
            prefix={
              !revealNeighbors.unlocked
                ? "Unlock"
                : revealNeighbors.count < (revealNeighbors.maxCount ?? Infinity)
                ? "Additional"
                : "Maxed out!"
            }
          />
        </div>
        <div className="full computed">
          Reveals random (hidden) neighbors of the square being tapped on.
          <br />
          CAUTION: it might trigger a mine if they have not been properly
          flagged!
        </div>
      </div>

      <div className="game-controls panel">
        <div className="title-bar">Game Automation</div>
      </div>

      <div className="game-controls panel">
        <div className="title-bar">Board Automation</div>
      </div>
    </div>
  );
}
