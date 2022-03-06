import React, { ChangeEvent } from "react";
import { Navigate } from "react-router";

import Settings from "../model/Settings";
import bind from "../utils/bind";
import store from "../utils/store";
import printTime from "../utils/time";

interface OptionsProps {
  onChange?: () => void;
}

interface OptionsState {
  textContents: string;
  reloading: boolean;
  resetAcknowledged: boolean;
}

export default class Options extends React.Component<
  OptionsProps,
  OptionsState
> {
  constructor(props: OptionsProps) {
    super(props);
    this.state = {
      textContents: "",
      reloading: false,
      resetAcknowledged: false,
    };
  }

  @bind
  getRawData() {
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

  @bind
  saveGame() {
    Settings.Save();
  }

  @bind
  loadGame() {
    if (Settings.Load()) {
      this.setState({ reloading: true });
    }
  }

  @bind
  exportGame() {
    this.setState({ textContents: store.saveAs(Settings.toObject()) });
  }

  @bind
  importGame() {
    if (Settings.fromObject(store.loadAs(this.state.textContents))) {
      this.setState({ reloading: true });
    }
  }

  @bind
  changeTickSpeed(event: ChangeEvent<HTMLInputElement>) {
    let tickSpeed = parseInt(event.target.value);
    if (tickSpeed >= 1 && tickSpeed <= 60) {
      Settings.ticksPerSecond = tickSpeed;
      if (this.props.onChange) {
        this.props.onChange();
      }
    }
  }

  @bind
  changeSaveFrequency(event: ChangeEvent<HTMLInputElement>) {
    let saveFreq = parseInt(event.target.value);
    if (saveFreq >= 1 && saveFreq <= 600) {
      Settings.saveFrequencySecs = 600 / saveFreq;
      if (this.props.onChange) {
        this.props.onChange();
      }
    }
  }

  @bind
  resetGame() {
    if (this.state.resetAcknowledged) {
      if (confirm("Are you sure you want to reset? This cannot be undone.")) {
        Settings.Reset();
        this.setState({ reloading: true });
      } else {
        this.setState({ resetAcknowledged: false });
      }
    }
  }

  render() {
    if (this.state.reloading) {
      this.setState({ reloading: false });
      if (this.props.onChange) {
        this.props.onChange();
      }

      return <Navigate to="/" />;
    }

    return (
      <div>
        <div className="panel options">
          <div className="title-bar">Game Data</div>
          <div className="full">
            You started this game
            {printTime({
              start: Settings.lastReset,
              end: Settings.lastUpdate,
              prefix: " ",
              suffix: " ago",
            })}
            .
          </div>
          <div className="full">
            This session started
            {printTime({
              start: Settings.lastLoaded,
              end: Settings.lastUpdate,
              prefix: " ",
              suffix: " ago",
            })}
            .
          </div>
          <div className="full">
            Game was last saved
            {printTime({
              start: Settings.lastSaved,
              end: Settings.lastUpdate,
              prefix: " ",
              suffix: " ago",
            })}
            .
          </div>
          <div className="title-bar"></div>
          <div className="half center">
            <input type="button" value="Load" onClick={this.loadGame} />
          </div>
          <div className="half center">
            <input type="button" value="Save" onClick={this.saveGame} />
          </div>
          <div className="half center">
            <input type="button" value="Import" onClick={this.importGame} />
          </div>
          <div className="half center">
            <input type="button" value="Export" onClick={this.exportGame} />
          </div>
          <div className="full center">
            <textarea
              value={this.state.textContents}
              onChange={(e) => this.setState({ textContents: e.target.value })}
            />
          </div>
        </div>

        <div className="panel options">
          <div className="title-bar">Advanced Settings</div>
          <div className="full">
            If you are having performance issues, increase the time between
            updates. Faster updating frequncies lead to better game experience
            but might use a lot of CPU.
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
              onInput={this.changeTickSpeed}
            />
          </div>
          <div className="title-bar"></div>
          <div className="full">
            Change how often the game is saved in the background. More frequent
            saving leads to faster backups, but increases CPU and I/O usage
          </div>
          <div className="half">Saving frequency:</div>
          <div className="half center">
            {printTime({
              start: 0,
              end: Settings.saveFrequencySecs * 1000,
              never: "",
              now: "",
              millis: Settings.saveFrequencySecs < 10,
            })}
          </div>
          <div className="half"></div>
          <div className="half center">
            <input
              type="range"
              min={1}
              max={60}
              value={600 / Settings.saveFrequencySecs}
              onInput={this.changeSaveFrequency}
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
                checked={this.state.resetAcknowledged}
                onChange={() =>
                  this.setState({
                    resetAcknowledged: !this.state.resetAcknowledged,
                  })
                }
              />
              I understand what this means and still want to reset the game
            </label>
          </div>
          <div className="full right">
            <input
              type="button"
              value="Reset everything"
              disabled={!this.state.resetAcknowledged}
              onClick={this.resetGame}
            />
          </div>
        </div>

        <div className="panel">
          <div className="title-bar">Raw Data</div>
          {this.getRawData()}
        </div>
      </div>
    );
  }
}
