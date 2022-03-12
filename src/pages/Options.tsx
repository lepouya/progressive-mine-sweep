import React, { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router";

import TimeDuration from "../utils/TimeDuration";
import useGameContext from "../utils/GameContext";

const Options: React.FC = () => {
  const { settings, load, loadAs, save, saveAs, reset } = useGameContext();
  const navigate = useNavigate();
  const [textContents, setTextContents] = useState("");
  const [resetAcknowledged, setResetAcknowledged] = useState(false);

  function saveGame() {
    save();
  }

  function loadGame() {
    if (load()) {
      navigate("/");
    }
  }

  function exportGame() {
    setTextContents(saveAs());
  }

  function importGame() {
    if (loadAs(textContents)) {
      navigate("/");
    }
  }

  function changeTickSpeed(event: ChangeEvent<HTMLInputElement>) {
    let tickSpeed = parseInt(event.target.value);
    if (tickSpeed >= 1 && tickSpeed <= 60) {
      settings.ticksPerSecond = tickSpeed;
    }
  }

  function changeSaveFrequency(event: ChangeEvent<HTMLInputElement>) {
    let saveFreq = parseInt(event.target.value);
    if (saveFreq >= 1 && saveFreq <= 600) {
      settings.saveFrequencySecs = 600 / saveFreq;
    }
  }

  function resetGame() {
    if (resetAcknowledged) {
      if (confirm("Are you sure you want to reset? This cannot be undone.")) {
        reset();
        navigate("/");
      } else {
        setResetAcknowledged(false);
      }
    }
  }

  return (
    <div>
      <div className="panel options">
        <div className="title-bar">Game Data</div>
        <div className="full">
          <TimeDuration
            start={settings.lastReset}
            end={settings.lastUpdate}
            prefix={"You started this game "}
            suffix={" ago"}
          />
          .
        </div>
        <div className="full">
          <TimeDuration
            start={settings.lastLoaded}
            end={settings.lastUpdate}
            prefix={"This session started "}
            suffix={" ago"}
          />
          .
        </div>
        <div className="full">
          <TimeDuration
            start={settings.lastSaved}
            end={settings.lastUpdate}
            prefix={"Game was last saved "}
            suffix={" ago"}
          />
          .
        </div>
        <div className="title-bar"></div>
        <div className="half center">
          <input type="button" value="Load" onClick={loadGame} />
        </div>
        <div className="half center">
          <input type="button" value="Save" onClick={saveGame} />
        </div>
        <div className="half center">
          <input type="button" value="Import" onClick={importGame} />
        </div>
        <div className="half center">
          <input type="button" value="Export" onClick={exportGame} />
        </div>
        <div className="full center">
          <textarea
            value={textContents}
            onChange={(e) => setTextContents(e.target.value)}
          />
        </div>
      </div>

      <div className="panel options">
        <div className="title-bar">Advanced Settings</div>
        <div className="full">
          If you are having performance issues, increase the time between
          updates. Faster updating frequncies lead to better game experience but
          might use a lot of CPU.
        </div>
        <div className="half">Updating frequency:</div>
        <div className="half center">
          {Math.floor(1000 / settings.ticksPerSecond)}ms
        </div>
        <div className="half"></div>
        <div className="half center">
          <input
            type="range"
            min={4}
            max={30}
            value={settings.ticksPerSecond}
            onInput={changeTickSpeed}
          />
        </div>
        <div className="title-bar"></div>
        <div className="full">
          Change how often the game is saved in the background. More frequent
          saving leads to faster backups, but increases CPU and I/O usage
        </div>
        <div className="half">Saving frequency:</div>
        <div className="half center">
          <TimeDuration
            end={settings.saveFrequencySecs * 1000}
            millis={settings.saveFrequencySecs < 10}
            never=""
            now=""
          />
        </div>
        <div className="half"></div>
        <div className="half center">
          <input
            type="range"
            min={1}
            max={60}
            value={600 / settings.saveFrequencySecs}
            onInput={changeSaveFrequency}
          />
        </div>
      </div>

      <div className="panel options reset">
        <div className="title-bar warning">Game Reset</div>
        <div className="full">
          WARNING: this will completely reset your game and delete all saved
          progress and setting. Only use this if you want to restart the game
          from beginning, or if something in the settings is so messed up that
          the game is now unplayable.
        </div>
        <div className="full">
          <label>
            <input
              type="checkbox"
              checked={resetAcknowledged}
              onChange={() => setResetAcknowledged(!resetAcknowledged)}
            />
            I understand what this means and still want to reset the game
          </label>
        </div>
        <div className="full right">
          <input
            type="button"
            value="Reset everything"
            disabled={!resetAcknowledged}
            onClick={resetGame}
          />
        </div>
      </div>
    </div>
  );
};

export default Options;
