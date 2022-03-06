import React from "react";
import Settings from "../model/Settings";
import bind from "../utils/bind";
import store from "../utils/store";
import printTime from "../utils/time";

interface OptionsProps {
  onChange?: () => void;
}

interface OptionsState {
  textContents: string;
}

export default class Options extends React.Component<
  OptionsProps,
  OptionsState
> {
  constructor(props: OptionsProps) {
    super(props);
    this.state = {
      textContents: "",
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
    if (this.props.onChange) {
      this.props.onChange();
    }
  }

  @bind
  loadGame() {
    Settings.Load();
    if (this.props.onChange) {
      this.props.onChange();
    }
  }

  @bind
  exportGame() {
    this.setState({ textContents: store.saveAs(Settings.toObject()) });
    if (this.props.onChange) {
      this.props.onChange();
    }
  }

  @bind
  importGame() {
    Settings.fromObject(store.loadAs(this.state.textContents));
    if (this.props.onChange) {
      this.props.onChange();
    }
  }

  render() {
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
        <div className="panel">
          <div className="title-bar">Raw Data</div>
          {this.getRawData()}
        </div>
      </div>
    );
  }
}