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
      this.resetTimer();
    }
  }

  componentWillUnmount() {
    this.resetTimer(false);
  }

  @bind
  resetTimer(startNew = true) {
    if (this.state.timerId) {
      clearInterval(this.state.timerId);
      this.setState({ timerId: undefined });
    }
    if (startNew) {
      const timerId = setInterval(this.tick, 1000 / Settings.ticksPerSecond);
      this.setState({ timerId });
    }
  }

  @bind
  tick() {
    const now = Date.now();

    // TODO: Update

    Settings.lastUpdate = now;
    this.setState({ lastUpdate: now });

    if (now - Settings.lastSaved >= Settings.saveFrequencySecs * 1000) {
      Settings.Save();
    }
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
          <div className="main">
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/help" element={<Help />} />
              <Route
                path="/options"
                element={<Options onChange={this.resetTimer} />}
              />
            </Routes>
          </div>
        </div>
      </HashRouter>
    );
  }
}
