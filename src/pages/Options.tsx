import React, { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router";

import Settings from "../model/Settings";
import store from "../utils/store";
import TimeDuration from "../utils/TimeDuration";

const Options: React.FC<{
  onChange?: () => void;
  lastUpdate: number;
}> = ({ onChange, lastUpdate }) => {
  const [textContents, setTextContents] = useState("");
  const [resetAcknowledged, setResetAcknowledged] = useState(false);

  const navigate = useNavigate();

  function changed() {
    if (onChange) {
      onChange();
    }
  }

  function saveGame() {
    Settings.Save();
    changed();
  }

  function loadGame() {
    if (Settings.Load()) {
      changed();
      navigate("/");
    }
  }

  function exportGame() {
    setTextContents(store.saveAs(Settings.toObject()));
    changed();
  }

  function importGame() {
    if (Settings.fromObject(store.loadAs(textContents))) {
      changed();
      navigate("/");
    }
  }

  function changeTickSpeed(event: ChangeEvent<HTMLInputElement>) {
    let tickSpeed = parseInt(event.target.value);
    if (tickSpeed >= 1 && tickSpeed <= 60) {
      Settings.ticksPerSecond = tickSpeed;
      changed();
    }
  }

  function changeSaveFrequency(event: ChangeEvent<HTMLInputElement>) {
    let saveFreq = parseInt(event.target.value);
    if (saveFreq >= 1 && saveFreq <= 600) {
      Settings.saveFrequencySecs = 600 / saveFreq;
      changed();
    }
  }

  function resetGame() {
    if (resetAcknowledged) {
      if (confirm("Are you sure you want to reset? This cannot be undone.")) {
        Settings.Reset();
        changed();
        navigate("/");
      } else {
        setResetAcknowledged(false);
      }
    }
  }

  function getRawData() {
    const settings = [];
    let pos = 0;

    let k: keyof typeof Settings;
    for (k in Settings) {
      const v = Settings[k];
      if (typeof v !== "function") {
        settings[pos++] = (
          <div key={k} className="full">
            <pre style={{ margin: "2px" }}>
              {k}: {typeof v === "object" ? JSON.stringify(v, null, 2) : v}
            </pre>
          </div>
        );
      }
    }

    return settings;
  }

  return (
    <div>
      <div className="panel options">
        <div className="title-bar">Game Data</div>
        <div className="full">
          <TimeDuration
            start={Settings.lastReset}
            end={lastUpdate}
            prefix={"You started this game "}
            suffix={" ago"}
          />
          .
        </div>
        <div className="full">
          <TimeDuration
            start={Settings.lastLoaded}
            end={lastUpdate}
            prefix={"This session started "}
            suffix={" ago"}
          />
          .
        </div>
        <div className="full">
          <TimeDuration
            start={Settings.lastSaved}
            end={lastUpdate}
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
          {Math.floor(1000 / Settings.ticksPerSecond)}ms
        </div>
        <div className="half"></div>
        <div className="half center">
          <input
            type="range"
            min={4}
            max={30}
            value={Settings.ticksPerSecond}
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
            end={Settings.saveFrequencySecs * 1000}
            millis={Settings.saveFrequencySecs < 10}
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
            value={600 / Settings.saveFrequencySecs}
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

      <div className="panel">
        <div className="title-bar">Raw Data</div>
        {getRawData()}
      </div>
    </div>
  );
};

export default Options;
