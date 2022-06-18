import assign from "../utils/assign";
import {
  loadFromBrowser,
  resetOnBrowser,
  saveToBrowser,
} from "../utils/localStorage";
import * as Store from "../utils/store";
import { Board, emptyBoard, genBoardState } from "./Board";
import { initGameResources } from "./GameResources";
import { Resource } from "./Resource";
import {
  genResourceManager,
  mergeResourceManagers,
  ResourceManager,
} from "./ResourceManager";
import { defaultSettings, Settings } from "./Settings";

export type Context<Update = any> = {
  settings: Settings;
  board: Board;
  resourceManager: ResourceManager<Context<Update>, Update>;
};

export function emptyContext<Update>(): Context<Update> {
  const context: any = {};

  context.settings = {
    ...defaultSettings,
    lastReset: Date.now(),
    lastUpdate: Date.now(),
    lastLoaded: Date.now(),
  };
  context.board = { ...emptyBoard };
  context.resourceManager = initGameResources(
    genResourceManager(context, context.settings),
  );

  return context;
}

export function wrapContext<Update>(context: Context<Update>) {
  return {
    ...context.resourceManager,
    ...context,
    context,

    setBoard: (board: Board) => (context.board = board),
    resource: (res: string | Resource<Context<Update>, Update>) =>
      context.resourceManager.get(res),

    load: () => _load(context, loadFromBrowser(_store)),
    loadAs: (loadStr: string) => _load(context, loadStr),

    save: (pretty?: boolean) => saveToBrowser(_store, _save(context, pretty)),
    saveAs: (pretty?: boolean) => _save(context, pretty),

    reset: () => _reset(context),
  };
}

const _store = "Context";

function _load<Update>(
  context: Context<Update>,
  loadStr: string | null,
): boolean {
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
    context.resourceManager.settings = context.settings;
    context.resourceManager.update(undefined, "load");
  } else {
    let k: keyof Context<Update>;
    for (k in oldContext) {
      assign(context, k, oldContext[k]);
    }
  }

  return loaded;
}

function _save<Update>(context: Context<Update>, pretty?: boolean): string {
  context.settings.lastSaved = Date.now();
  return Store.saveAs(context, pretty);
}

function _reset<Update>(context: Context<Update>): void {
  resetOnBrowser(_store);
  const newContext = emptyContext<Update>();
  let k: keyof Context<Update>;
  for (k in newContext) {
    assign(context, k, newContext[k]);
  }
}
