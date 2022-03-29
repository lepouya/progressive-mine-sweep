import React, { useCallback, useContext } from "react";
import { Settings, emptySettings } from "../model/Settings";
import { Board, emptyBoard } from "../model/Board";
import * as Store from "./store";
import {
  genResourceManager,
  mergeResourceManagers,
  ResourceManager,
} from "../model/ResourceManager";

type GameContext = {
  settings: Settings;
  board: Board;
  resources: ResourceManager;
};

const emptyGameContext = {
  settings: { ...emptySettings },
  board: { ...emptyBoard },
  resources: genResourceManager(),
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
    const saved = Store.save(_saveStoreName, context);
    if (saved) {
      context.settings.lastSaved = Date.now();
    }
    return saved;
  }, [context]);

  const load = useCallback(() => {
    const oldResources = context.resources;
    const loaded = Store.load(_saveStoreName, context);

    if (loaded) {
      context.settings.lastLoaded = Date.now();
      context.resources = mergeResourceManagers(
        oldResources,
        context.resources,
      );
      context.resources.update(context.settings.lastLoaded);
    } else {
      context.resources = oldResources;
    }

    return loaded;
  }, [context]);

  const reset = useCallback(() => {
    Store.reset(_saveStoreName);
    context.settings = {
      ...emptySettings,
      lastReset: Date.now(),
      lastLoaded: Date.now(),
    };
    context.board = { ...emptyBoard };
    context.resources = genResourceManager();
  }, [context]);

  const saveAs = useCallback(() => {
    context.settings.lastSaved = Date.now();
    return Store.saveAs(context);
  }, [context]);

  const loadAs = useCallback(
    (str: string) => {
      const oldResources = context.resources;
      const loaded = Store.loadAs(context, str);

      if (loaded) {
        context.settings.lastLoaded = Date.now();
        context.resources = mergeResourceManagers(
          oldResources,
          context.resources,
        );
        context.resources.update(context.settings.lastLoaded);
      } else {
        context.resources = oldResources;
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
