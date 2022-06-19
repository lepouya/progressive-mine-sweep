import ModeControls from "../components/ModeControls";
import ResourceBar from "../components/ResourceBar";

export default function Automation() {
  return (
    <div id="automation">
      <ResourceBar />
      <ModeControls showTapMode={false} />

      <div className="game-controls panel">
        <div className="title-bar">Cell Automation</div>
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
