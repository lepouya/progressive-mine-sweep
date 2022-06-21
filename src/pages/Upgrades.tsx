import BuyButton from "../components/BuyButton";
import useGameContext from "../components/GameContext";
import ModeControls from "../components/ModeControls";
import ResourceBar from "../components/ResourceBar";
import ResourceRender from "../components/ResourceRender";
import { scoreMultiplier } from "../model/GameFormulas";

export default function Upgrades() {
  const {
    context,
    resources: {
      rows,
      cols,
      difficulty,
      hintQuality,
      hintsCount,
      resetSpeed,
      revealNeighbors,
    },
  } = useGameContext();

  return (
    <div id="upgrades">
      <ResourceBar />
      <ModeControls showTapMode={false} />

      <div className="game-controls panel" id="game-upgrades">
        <div className="title-bar">Game Upgrades</div>

        <div className="quarter">Game Width:</div>
        <div className="quarter">
          <ResourceRender
            resource={cols}
            showChrome={true}
            infix=""
            className="value-first"
          />
        </div>
        <div className="right half">
          <BuyButton resource={cols} prefix="Expand" maxCount={50} />
        </div>
        <div className="quarter">Game Height:</div>
        <div className="quarter">
          <ResourceRender
            resource={rows}
            showChrome={true}
            infix=""
            className="value-first"
          />
        </div>
        <div className="right half">
          <BuyButton resource={rows} prefix="Expand" maxCount={50} />
        </div>

        <div className="quarter">Game Difficulty:</div>
        <div className="quarter">
          <ResourceRender
            resource={difficulty}
            showChrome={true}
            showName={false}
            infix=""
            className="value-first"
          />
        </div>
        <div className="right half">
          <BuyButton resource={difficulty} prefix="Increase" maxCount={100} />
        </div>
        <div className="quarter">
          <span className="computed">Score Multiplier:</span>
        </div>
        <div className="quarter">
          <ResourceRender
            value={scoreMultiplier(context) * 100}
            display="percentage"
            showChrome={true}
            className="computed"
          />
        </div>
        <div className="right half">
          <BuyButton
            resource={difficulty}
            prefix="Decrease"
            gainMultiplier={-1}
            enabled={difficulty.count > 0}
            minNum={1}
            maxNum={1}
            increment={1}
          />
        </div>
      </div>

      <div className="game-controls panel">
        <div className="title-bar">Quality Upgrades</div>

        <div className="quarter">Reset Speed:</div>
        <div className="quarter">
          <ResourceRender
            resource={resetSpeed}
            showChrome={true}
            showName={false}
            infix=""
            className="value-first"
          />
        </div>
        <div className="right half">
          <BuyButton resource={resetSpeed} prefix="Speed up" maxCount={100} />
        </div>

        <hr className="separator" />

        <div className="quarter">Hint Quality:</div>
        <div className="quarter">
          <ResourceRender
            resource={hintQuality}
            showChrome={true}
            showName={false}
            infix=""
            className="value-first"
          />
        </div>
        <div className="right half">
          <BuyButton resource={hintQuality} prefix="Improve" maxCount={100} />
        </div>

        <div className="quarter">Number of hints on purchase:</div>
        <div className="quarter">
          <ResourceRender
            resource={hintsCount}
            showChrome={true}
            infix=""
            className="value-first"
          />
        </div>
        <div className="right half">
          <BuyButton resource={hintsCount} prefix="Improve" />
        </div>

        <hr className="separator" />

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
    </div>
  );
}
