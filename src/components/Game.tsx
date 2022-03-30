import React, { useEffect, useState } from "react";
import { HashRouter, NavLink, Route, Routes } from "react-router-dom";

import Main from "../pages/Main";
import Help from "../pages/Help";
import Options from "../pages/Options";
import useGameContext from "../utils/GameContext";

const Game: React.FC = () => {
  const { settings, resourceManager, save } = useGameContext();
  const [timerId, setTimerId] = useState<NodeJS.Timer | null>(null);
  const [_, setLastUpdate] = useState(0);

  useEffect(() => {
    setTimerId(setInterval(tick, 1000 / settings.ticksPerSecond));

    return () => {
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
    };
  }, [settings, settings.ticksPerSecond]);

  function tick() {
    const now = Date.now();

    settings.lastUpdate = now;
    resourceManager.update(now, settings);

    if (
      now - settings.lastSaved >= settings.saveFrequencySecs * 1000 &&
      now - settings.lastLoaded >= settings.saveFrequencySecs * 1000
    ) {
      save();
    }

    // Signal the update down to child elements
    setLastUpdate(now);
  }

  function activeClass(props: { isActive: boolean }): string {
    return props.isActive ? "active" : "";
  }

  return (
    <HashRouter>
      <nav className="navbar">
        <div className="left">
          <NavLink className={activeClass} to="/">
            Mine Sweep
          </NavLink>
          <NavLink className={activeClass} to="/help">
            Help
          </NavLink>
        </div>
        <div className="right">
          <NavLink className={activeClass} to="/options">
            Settings
          </NavLink>
        </div>
      </nav>
      <div className="main">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/help" element={<Help />} />
          <Route path="/options" element={<Options />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default Game;
