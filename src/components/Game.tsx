import React, { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import Main from "../pages/Main";
import Help from "../pages/Help";
import Options from "../pages/Options";
import useGameContext from "../utils/GameContext";
import Link from "../utils/Link";
import Stats from "../pages/Stats";

const Game: React.FC = () => {
  const { settings, resourceManager, save } = useGameContext();
  const [timerId, setTimerId] = useState<NodeJS.Timer | undefined>();
  const [_, setLastRendered] = useState(0);

  useEffect(() => {
    if (timerId) {
      clearInterval(timerId);
    }
    setTimerId(setInterval(tick, 1000.0 / settings.ticksPerSecond));

    return () => {
      if (timerId) {
        clearInterval(timerId);
        setTimerId(undefined);
      }
    };
  }, [settings, settings.ticksPerSecond]);

  function tick() {
    // Update resources
    resourceManager.update(undefined, settings, "tick");

    // Save game
    if (
      settings.lastUpdate - settings.lastSaved >=
        settings.saveFrequencySecs * 1000 &&
      settings.lastUpdate - settings.lastLoaded >=
        settings.saveFrequencySecs * 1000
    ) {
      save();
    }

    // Force re-render of child components
    setLastRendered((lastRendered) =>
      settings.lastUpdate - lastRendered >= 1000.0 / settings.framesPerSecond
        ? settings.lastUpdate
        : lastRendered,
    );
  }

  return (
    <HashRouter>
      <nav className="navbar">
        <div className="left">
          <Link to="/">Mine Sweep</Link>
          <Link to="/statistics">Statistics</Link>
        </div>
        <div className="right">
          <Link to="/help">Help</Link>
          <Link to="/options">Settings</Link>
        </div>
      </nav>
      <div className="main">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/statistics" element={<Stats />} />
          <Route path="/help" element={<Help />} />
          <Route path="/options" element={<Options />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default Game;
