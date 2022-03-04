import React from "react";
import { HashRouter, NavLink, Route, Routes } from "react-router-dom";

import Main from "../pages/Main";
import Help from "../pages/Help";
import bind from "../utils/bind";
import Settings from "../model/Settings";

interface GameProps {}

interface GameState {
  lastUpdate: number;
  timerId?: NodeJS.Timer;
}

export default class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);

    this.state = {
      lastUpdate: Date.now(),
      timerId: undefined,
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
  tick() {
    const now = Date.now();

    // TODO: Update, save, etc

    Settings.lastUpdate = now;
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
                <li>-</li>
              </ul>
            </div>
          </nav>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </div>
      </HashRouter>
    );
  }
}
