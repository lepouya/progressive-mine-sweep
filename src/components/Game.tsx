import React from "react";
import { HashRouter, NavLink, Route, Routes } from "react-router-dom";

import Main from "../pages/Main";
import Help from "../pages/Help";
import bind from "../utils/bind";
import Settings from "../model/Settings";
import Options from "../pages/Options";

interface GameProps {}

interface GameState {
  timerId?: NodeJS.Timer;
  lastUpdate: number;
}

export default class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);

    this.state = {
      timerId: undefined,
      lastUpdate: 0,
    };
  }

  componentDidMount() {
    if (!this.state.timerId) {
      const timerId = setInterval(this.tick, 1000 / Settings.ticksPerSecond);
      this.setState({ timerId });
    }
  }

  componentWillUnmount() {
    if (this.state.timerId) {
      clearInterval(this.state.timerId);
      this.setState({ timerId: undefined });
    }
  }

  @bind
  resetTimer() {
    if (this.state.timerId) {
      clearInterval(this.state.timerId);
    }
    const timerId = setInterval(this.tick, 1000 / Settings.ticksPerSecond);
    this.setState({ timerId });
  }

  @bind
  tick() {
    const now = Date.now();

    // TODO: Update, save, etc

    Settings.lastUpdate = now;
    if (now - Settings.lastSaved >= Settings.saveFrequencySecs * 1000) {
      Settings.Save();
    }

    this.setState({ lastUpdate: now });
  }

  render() {
    return (
      <HashRouter>
        <div>
          <nav className="navbar">
            <div className="navbar-left">
              <ul>
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "navbar-active" : ""
                    }
                    to="/"
                  >
                    Mine Sweep
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "navbar-active" : ""
                    }
                    to="/help"
                  >
                    Help
                  </NavLink>
                </li>
              </ul>
            </div>
            <div className="navbar-right">
              <ul>
                <li>
                  {" "}
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "navbar-active" : ""
                    }
                    to="/options"
                  >
                    Settings
                  </NavLink>
                </li>
              </ul>
            </div>
          </nav>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/help" element={<Help />} />
            <Route
              path="/options"
              element={<Options onChange={this.resetTimer} />}
            />
          </Routes>
        </div>
      </HashRouter>
    );
  }
}
