import React, { useCallback, useEffect, useState } from "react";
import { HashRouter, NavLink, Route, Routes } from "react-router-dom";

import Main from "../pages/Main";
import Help from "../pages/Help";
import Settings from "../model/Settings";
import Options from "../pages/Options";

const Game: React.FC = () => {
  const [timerId, setTimerId] = useState(null as NodeJS.Timer | null);
  const [_, setLastUpdate] = useState(0);

  useEffect(() => {
    resetTimer();
    return () => resetTimer(false);
  }, []);

  const resetTimer = useCallback(
    (startNew = true) => {
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
      if (startNew) {
        setTimerId(setInterval(tick, 1000 / Settings.ticksPerSecond));
      }
    },
    [timerId],
  );

  const tick = useCallback(() => {
    const now = Date.now();

    // TODO: Update

    // Signal the update down to child elements
    Settings.lastUpdate = now;
    setLastUpdate(now);

    if (now - Settings.lastSaved >= Settings.saveFrequencySecs * 1000) {
      Settings.Save();
    }
  }, []);

  return (
    <HashRouter>
      <div>
        <nav className="navbar">
          <div className="left">
            <ul>
              <li>
                <NavLink
                  className={({ isActive }) => (isActive ? "active" : "")}
                  to="/"
                >
                  Mine Sweep
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) => (isActive ? "active" : "")}
                  to="/help"
                >
                  Help
                </NavLink>
              </li>
            </ul>
          </div>
          <div className="right">
            <ul>
              <li>
                <NavLink
                  className={({ isActive }) => (isActive ? "active" : "")}
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
              element={<Options onChange={resetTimer} />}
            />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
};

export default Game;
