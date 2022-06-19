import BuyButton from "../components/BuyButton";
import useGameContext from "../components/GameContext";
import ModeControls from "../components/ModeControls";
import ResourceBar from "../components/ResourceBar";
import ResourceRender from "../components/ResourceRender";
import { scoreMultiplier } from "../model/GameFormulas";

export default function Upgrades() {
  const {
    context,
    resources: { rows, cols, difficulty, hintQuality, resetSpeed },
  } = useGameContext();

  return (
    <div id="upgrades">
      <ResourceBar />
      <ModeControls showTapMode={false} />

      <div className="game-controls panel">
        <div className="title-bar">Upgrades</div>

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
      </div>
    </div>
  );
}
