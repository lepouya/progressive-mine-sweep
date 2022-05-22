import assign from "../utils/assign";
import * as Store from "../utils/store";

import { Settings, defaultSettings } from "./Settings";
import { Board, emptyBoard, genBoardState } from "./Board";
import {
  genResourceManager,
  mergeResourceManagers,
  ResourceManager,
} from "./ResourceManager";
import { Resource } from "./Resource";
import { initGameResources } from "./GameResources";

export type Context = {
  settings: Settings;
  board: Board;
  resourceManager: ResourceManager;
};

export const emptyContext: () => Context = () => ({
  settings: {
    ...defaultSettings,
    lastReset: Date.now(),
    lastUpdate: Date.now(),
    lastLoaded: Date.now(),
  },
  board: { ...emptyBoard },
  resourceManager: initGameResources(genResourceManager()),
});

export const wrapContext = (context: Context) => ({
  ...context,

  setBoard: (board: Board) => (context.board = board),
  resource: (res: string | Resource) => context.resourceManager.get(res),

  load: () => _load(context, () => Store.load(_store, context)),
  loadAs: (str: string) => _load(context, () => Store.loadAs(context, str)),

  save: (pretty?: boolean) =>
    _save(context, () => Store.save(_store, context, pretty)),
  saveAs: (pretty?: boolean) =>
    _save(context, () => Store.saveAs(context, pretty)),

  reset: () => _reset(context),
});

const _store = "Context";

function _load<T>(context: Context, loadFunction: () => T): T {
  const oldContext = { ...context };
  const loaded = loadFunction();

  if (loaded) {
    context.settings = {
      ...oldContext.settings,
      ...context.settings,
      lastLoaded: Date.now(),
    };

    context.board = genBoardState({ ...oldContext.board, ...context.board });

    context.resourceManager = mergeResourceManagers(
      oldContext.resourceManager,
      context.resourceManager,
    );
    context.resourceManager.update(
      context.settings.lastLoaded,
      context.settings,
      "load",
    );
  } else {
    let k: keyof Context;
    for (k in oldContext) {
      assign(context, k, oldContext[k]);
    }
  }

  return loaded;
}

function _save<T>(context: Context, saveFunction: () => T): T {
  context.settings.lastSaved = Date.now();
  return saveFunction();
}

function _reset(context: Context): void {
  Store.reset(_store);
  const newContext = emptyContext();
  let k: keyof Context;
  for (k in newContext) {
    assign(context, k, newContext[k]);
  }
}
