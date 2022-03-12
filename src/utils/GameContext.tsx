import React, { useCallback, useContext } from "react";
import { Settings, emptySettings } from "../model/Settings";
import { Board, emptyBoard } from "../model/Board";
import store from "./store";

type GameContext = {
  settings: Settings;
  board: Board;
};

const emptyGameContext = {
  settings: { ...emptySettings },
  board: { ...emptyBoard },
};

const GameReactContext = React.createContext<GameContext>(emptyGameContext);

export const GameContextProvider: React.FC = (props) => {
  return (
    <GameReactContext.Provider value={{ ...emptyGameContext }}>
      {props.children}
    </GameReactContext.Provider>
  );
};

const _saveStoreName = "GameContext";

export const useGameContext = () => {
  const context = useContext(GameReactContext);

  const setBoard = (board: Board) => (context.board = board);

  const save = useCallback(() => {
    const saved = store.save(_saveStoreName, context);
    if (saved) {
      context.settings.lastSaved = Date.now();
    }
    return saved;
  }, [context]);

  const load = useCallback(() => {
    const loaded = store.load(_saveStoreName, context);
    if (loaded) {
      context.settings.lastLoaded = Date.now();
    }
    return loaded;
  }, [context]);

  const reset = useCallback(() => {
    store.reset(_saveStoreName);
    context.settings = {
      ...emptySettings,
      lastReset: Date.now(),
      lastLoaded: Date.now(),
    };
    context.board = { ...emptyBoard };
  }, [context]);

  const saveAs = useCallback(() => {
    context.settings.lastSaved = Date.now();
    return store.saveAs(context);
  }, [context]);

  const loadAs = useCallback(
    (str: string) => {
      const loaded = store.loadAs(context, str);
      if (loaded) {
        context.settings.lastLoaded = Date.now();
      }
      return loaded;
    },
    [context],
  );

  return {
    ...context,
    setBoard,
    save,
    load,
    reset,
    saveAs,
    loadAs,
  };
};

export default useGameContext;
