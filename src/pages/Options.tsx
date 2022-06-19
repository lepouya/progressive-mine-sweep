import { ChangeEvent, MouseEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import useGameContext from "../components/GameContext";
import ResourceRender from "../components/ResourceRender";
import themeData from "../data/themes.json";
import { setTheme } from "../utils/document";
import { loadFromFile, saveToFile } from "../utils/fileStorage";

export default function Options() {
  const context = useGameContext();
  const [textContents, setTextContents] = useState("");
  const [resetAcknowledged, setResetAcknowledged] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const settings = context.settings;
  const themes = themeData as Record<string, string>;
  const debug = location.search.toLowerCase().includes("debug");

  function saveGame() {
    context.save(debug);
  }

  function loadGame() {
    if (context.load()) {
      navigate({ pathname: "/", search: location.search });
    }
  }

  function exportGame() {
    setTextContents(context.saveAs(debug));
  }

  function importGame() {
    if (context.loadAs(textContents)) {
      navigate({ pathname: "/", search: location.search });
    }
  }

  function loadFile() {
    loadFromFile((contents) => {
      if (context.loadAs(contents)) {
        navigate({ pathname: "/", search: location.search });
      }
    });
  }

  function saveFile() {
    const date = new Date()
      .toISOString()
      .replace(/\D/g, " ")
      .trim()
      .replace(/\D/g, "-");
    saveToFile(`progressive-mine-sweep-${date}`, context.saveAs(debug));
  }

  function changeFrequency(timer: string, value: string) {
    let freq = parseInt(value);
    if (freq >= 1 && freq <= 1000) {
      switch (timer) {
        case "tick":
          settings.ticksPerSecond = freq;
          break;
        case "render":
          settings.framesPerSecond = freq;
          break;
        case "save":
          settings.saveFrequencySecs = 600 / freq;
          break;
      }
    }
  }

  function changeTheme(event: MouseEvent) {
    settings.theme =
      (event.target as HTMLElement).getAttribute("theme") ?? undefined;
    setTheme(settings.theme);
  }

  function resetGame() {
    if (resetAcknowledged) {
      if (confirm("Are you sure you want to reset? This cannot be undone.")) {
        context.reset();
        navigate({ pathname: "/", search: location.search });
      } else {
        setResetAcknowledged(false);
      }
    }
  }

  return (
    <div id="options">
      <div className="panel options" id="options-theme">
        <div className="title-bar">Theme Options</div>
        <div className="full">
          Current theme is: {themes[settings.theme ?? ""] ?? "default"}
        </div>
        {Object.keys(themes).map((theme) => (
          <div key={`theme-${theme}`} className="half center">
            <div className="themed" id={`theme-${theme}`} theme={theme}>
              <button
                id={`button-theme-${theme}`}
                theme={theme}
                onClick={changeTheme}
              >
                {themes[theme]}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="panel options" id="options-data">
        <div className="title-bar">Game Data</div>
        <div className="full">
          <ResourceRender
            epoch={settings.lastReset / 1000}
            value={settings.lastUpdate / 1000}
            display="time"
            precision={0}
            prefix="You started this game "
          />
        </div>
        <div className="full">
          <ResourceRender
            epoch={settings.lastLoaded / 1000}
            value={settings.lastUpdate / 1000}
            display="time"
            precision={0}
            prefix="This session started "
          />
        </div>
        <div className="full">
          <ResourceRender
            epoch={settings.lastSaved / 1000}
            value={settings.lastUpdate / 1000}
            display="time"
            precision={0}
            prefix="Game was last saved "
          />
        </div>
        <hr className="separator" />
        <div className="half center">
          <input
            type="button"
            value="Load"
            onClick={loadGame}
            id="button-load"
          />
        </div>
        <div className="half center">
          <input
            type="button"
            value="Save"
            onClick={saveGame}
            id="button-save"
          />
        </div>
        <div className="half center">
          <input
            type="button"
            value="Load from File"
            onClick={loadFile}
            id="button-file-load"
          />
        </div>
        <div className="half center">
          <input
            type="button"
            value="Save to File"
            onClick={saveFile}
            id="button-file-save"
          />
        </div>
        <div className="half center">
          <input
            type="button"
            value="Import"
            onClick={importGame}
            id="button-import"
          />
        </div>
        <div className="half center">
          <input
            type="button"
            value="Export"
            onClick={exportGame}
            id="button-export"
          />
        </div>
        <div className="full center" id="export-text">
          <textarea
            value={textContents}
            onChange={(e) => setTextContents(e.target.value)}
          />
        </div>
      </div>

      <div className="panel options" id="options-advanced">
        <div className="title-bar">Advanced Settings</div>
        <div className="full">
          If you are having performance issues, increase the time between
          updates. Faster updating frequncies lead to better game experience but
          might use a lot of CPU.
        </div>
        <div className="half">Updating frequency:</div>
        <div className="half center">
          {Math.floor(1000.0 / settings.ticksPerSecond)}ms
        </div>
        <div className="half"></div>
        <div className="half center">
          <input
            type="range"
            min={1}
            max={1000}
            value={settings.ticksPerSecond}
            onInput={(e: ChangeEvent<HTMLInputElement>) =>
              changeFrequency("tick", e.target.value)
            }
            id="input-freq-tick"
          />
        </div>

        <div className="full"></div>
        <div className="half">Rendering frequency:</div>
        <div className="half center">
          {Math.floor(1000.0 / settings.framesPerSecond)}ms
        </div>
        <div className="half"></div>
        <div className="half center">
          <input
            type="range"
            min={1}
            max={60}
            value={settings.framesPerSecond}
            onInput={(e: ChangeEvent<HTMLInputElement>) =>
              changeFrequency("render", e.target.value)
            }
            id="input-freq-render"
          />
        </div>

        <div className="full">
          Change how often the game is saved in the background. More frequent
          saving leads to faster backups, but increases CPU and I/O usage
        </div>
        <div className="half">Saving frequency:</div>
        <div className="half center">
          <ResourceRender
            value={settings.saveFrequencySecs}
            display="time"
            precision={0}
          />
        </div>
        <div className="half"></div>
        <div className="half center">
          <input
            type="range"
            min={1}
            max={60}
            value={600 / settings.saveFrequencySecs}
            onInput={(e: ChangeEvent<HTMLInputElement>) =>
              changeFrequency("save", e.target.value)
            }
            id="input-freq-save"
          />
        </div>
      </div>

      <div className="panel options reset" id="options-reset">
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
              id="acknowledge-box"
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
            id="button-wipeall"
          />
        </div>
      </div>

      {debug && (
        <div className="panel options debug" id="options-debug">
          <div className="title-bar">Debug Context</div>
          <div className="half">Settings:</div>
          <div className="full" id="debug-settings">
            {JSON.stringify(settings, null, 2)}
          </div>
          <hr className="separator" />
          <div className="half">Resources:</div>
          <div className="full" id="debug-resources">
            {JSON.stringify(
              context.resourceManager,
              (key, value) => (key !== "context" ? value : undefined),
              2,
            )}
          </div>
          <hr className="separator" />
          <div className="half">Board:</div>
          <div className="full" id="debug-board">
            {JSON.stringify(context.board, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}
