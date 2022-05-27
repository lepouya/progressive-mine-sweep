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
import {
  loadFromBrowser,
  resetOnBrowser,
  saveToBrowser,
} from "../utils/localStorage";

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

  load: () => _load(context, loadFromBrowser(_store)),
  loadAs: (loadStr: string) => _load(context, loadStr),

  save: (pretty?: boolean) => saveToBrowser(_store, _save(context, pretty)),
  saveAs: (pretty?: boolean) => _save(context, pretty),

  reset: () => _reset(context),
});

const _store = "Context";

function _load(context: Context, loadStr: string | null): boolean {
  const oldContext = { ...context };
  const loaded = !!loadStr && Store.loadAs(context, loadStr);

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

function _save(context: Context, pretty?: boolean): string {
  context.settings.lastSaved = Date.now();
  return Store.saveAs(context, pretty);
}

function _reset(context: Context): void {
  resetOnBrowser(_store);
  const newContext = emptyContext();
  let k: keyof Context;
  for (k in newContext) {
    assign(context, k, newContext[k]);
  }
}
