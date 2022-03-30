import React, { useCallback, useContext } from "react";
import { Settings, defaultSettings } from "../model/Settings";
import { Board, emptyBoard } from "../model/Board";
import * as Store from "./store";
import {
  genResourceManager,
  mergeResourceManagers,
  ResourceManager,
} from "../model/ResourceManager";
import assign from "./assign";

type GameContext = {
  settings: Settings;
  board: Board;
  resourceManager: ResourceManager;
};

const emptyGameContext: GameContext = {
  settings: { ...defaultSettings },
  board: { ...emptyBoard },
  resourceManager: genResourceManager(),
};

const GameReactContext = React.createContext<GameContext>(emptyGameContext);

export const GameContextProvider: React.FC = (props) => {
  return (
    <GameReactContext.Provider value={{ ...emptyGameContext }}>
      {props.children}
    </GameReactContext.Provider>
  );
};

function loadWrapper(
  context: GameContext,
  loadFunction: () => boolean,
): boolean {
  const oldContext = { ...context };
  const loaded = loadFunction();

  if (loaded) {
    context.settings = {
      ...oldContext.settings,
      ...context.settings,
      lastLoaded: Date.now(),
    };

    context.resourceManager = mergeResourceManagers(
      oldContext.resourceManager,
      context.resourceManager,
    );
    context.resourceManager.update(context.settings.lastLoaded);
  } else {
    let k: keyof GameContext;
    for (k in oldContext) {
      assign(context, k, oldContext[k]);
    }
  }

  return loaded;
}

const _saveStoreName = "GameContext";

export const useGameContext = () => {
  const context = useContext(GameReactContext);

  const setBoard = (board: Board) => (context.board = board);

  const resource = (res: string) => context.resourceManager.get(res);

  const save = () => {
    const saved = Store.save(_saveStoreName, context);
    if (saved) {
      context.settings.lastSaved = Date.now();
    }
    return saved;
  };

  const saveAs = () => {
    context.settings.lastSaved = Date.now();
    return Store.saveAs(context);
  };

  const load = () =>
    loadWrapper(context, () => Store.load(_saveStoreName, context));

  const loadAs = (str: string) =>
    loadWrapper(context, () => Store.loadAs(context, str));

  const reset = useCallback(() => {
    Store.reset(_saveStoreName);
    context.settings = {
      ...defaultSettings,
      lastReset: Date.now(),
      lastLoaded: Date.now(),
    };
    context.board = { ...emptyBoard };
    context.resourceManager = genResourceManager();
  }, [context]);

  return {
    ...context,
    setBoard,
    resource,
    save,
    load,
    reset,
    saveAs,
    loadAs,
  };
};

export default useGameContext;
