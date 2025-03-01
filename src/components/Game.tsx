import { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import { genBoardState } from "../model/Board";
import { stateChanged } from "../model/GameFormulas";
import Achievements from "../pages/Achievements";
import Automation from "../pages/Automation";
import Help from "../pages/Help";
import Main from "../pages/Main";
import Options from "../pages/Options";
import Stats from "../pages/Stats";
import Tutorial from "../pages/Tutorial";
import Upgrades from "../pages/Upgrades";
import { setTheme } from "../utils/document";
import useGameContext from "./GameContext";
import Link from "./Link";
import toast from "./Toast";

export default function Game() {
  const {
    context,
    settings,
    resourceManager,
    save,
    resources: { automation, resets },
  } = useGameContext();
  const [timerId, setTimerId] = useState<NodeJS.Timeout | undefined>();
  const [_, setLastRendered] = useState(0);

  useEffect(
    function () {
      if (timerId) {
        clearInterval(timerId);
      }
      setTimerId(setInterval(tick, 1000.0 / settings.ticksPerSecond));
      setTheme(settings.theme);

      return () => {
        if (timerId) {
          clearInterval(timerId);
          setTimerId(undefined);
        }
      };
    },
    [settings, settings.ticksPerSecond, settings.theme],
  );

  function tick() {
    // Update resources
    const curBoardState = context.board.state;
    const updated = resourceManager.update(undefined, "tick");
    if (updated.includes(true)) {
      context.board = genBoardState(context.board, context.settings.maxErrors);
      context.board = { ...context.board };
      if (context.board.state !== curBoardState) {
        stateChanged(
          context,
          "board",
          context.board.state,
          !context.board.hadUserAction,
        );
      }
    }

    // Save game
    if (
      settings.lastUpdate - settings.lastSaved >=
        settings.saveFrequencySecs * 1000 &&
      settings.lastUpdate - settings.lastLoaded >=
        settings.saveFrequencySecs * 1000
    ) {
      save();
      toast.info("Game saved!");
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
          <Link to="/">Minefield</Link>
          <Link to="/upgrades" condition={resets.extra.total > 1}>
            Upgrades
          </Link>
          <Link to="/auto" condition={automation.extra.total >= 5}>
            Automation
          </Link>
        </div>
        <div className="spacer"></div>
        <div className="right">
          <Link to="/achievements">Achievements</Link>
          <Link to="/stats">Statistics</Link>
          <Link to="/help">Help</Link>
          <Link to="/options">Settings</Link>
        </div>
      </nav>
      <Tutorial />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/upgrades" element={<Upgrades />} />
        <Route path="/auto" element={<Automation />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/help" element={<Help />} />
        <Route path="/options" element={<Options />} />
      </Routes>
    </HashRouter>
  );
}
