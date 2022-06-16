import { useMemo } from "react";

import useGameContext from "../components/GameContext";

export default function Reset() {
  const context = useGameContext();
  const saveData = useMemo(() => context.saveAs(true), []);

  function resetGame() {
    if (confirm("Are you sure you want to reset? This cannot be undone.")) {
      context.reset();
      window.location.reload();
    }
  }

  return (
    <div id="reset">
      <div className="panel options">
        <div className="title-bar">Load Failure!</div>
        <div className="full">
          Looks like something went very wrong in loading the game. It's
          possible that the game version is out of date, or that the save data
          is corrupt.
        </div>
        <hr className="separator" />
        <div className="full">
          For your records, here is the current contents of the save state. Keep
          this somewhere before resetting the game:
        </div>
        <div className="full center">
          <textarea value={saveData} readOnly={true} />
        </div>
      </div>

      <div className="panel options reset">
        <div className="title-bar warning">Game Reset</div>
        <div className="full">
          WARNING: this will completely reset your game and delete all saved
          progress and settings. This will hard reset the game from beginning.
        </div>
        <div className="full right">
          <input
            type="button"
            value="Hard Reset Everything"
            onClick={resetGame}
          />
        </div>
      </div>
    </div>
  );
}
