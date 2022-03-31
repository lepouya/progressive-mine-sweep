import React, { useEffect, useState } from "react";
import { HashRouter, NavLink, Route, Routes } from "react-router-dom";

import Main from "../pages/Main";
import Help from "../pages/Help";
import Options from "../pages/Options";
import useGameContext from "../utils/GameContext";

const Game: React.FC = () => {
  const { settings, resourceManager, save } = useGameContext();
  const [timerId, setTimerId] = useState<NodeJS.Timer | undefined>();
  const [_, setLastUpdate] = useState(0);

  useEffect(() => {
    if (timerId) {
      clearInterval(timerId);
    }
    setTimerId(setInterval(tick, 1000 / settings.ticksPerSecond));

    return () => {
      if (timerId) {
        clearInterval(timerId);
        setTimerId(undefined);
      }
    };
  }, [settings, settings.ticksPerSecond]);

  function tick() {
    resourceManager.update(undefined, settings, "tick");
    setLastUpdate(settings.lastUpdate);

    if (
      settings.lastUpdate - settings.lastSaved >=
        settings.saveFrequencySecs * 1000 &&
      settings.lastUpdate - settings.lastLoaded >=
        settings.saveFrequencySecs * 1000
    ) {
      save();
    }
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
