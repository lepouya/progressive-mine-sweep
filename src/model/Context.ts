import assign from "../utils/assign";
import * as LocalStore from "../utils/localStorage";
import * as Store from "../utils/store";
import { Board, emptyBoard, genBoardState } from "./Board";
import { genResourceManager, Resource, ResourceManager } from "./Resource";
import { defaultSettings, Settings } from "./Settings";

export type Context<Update = any> = {
  settings: Settings;
  board: Board;
  resourceManager: ResourceManager<Context<Update>, Update>;
};

export function emptyContext<Update>(
  oldContext?: Partial<Context<Update>>,
): Context<Update> {
  const context: any = oldContext || {};

  context.settings = {
    ...defaultSettings,
    lastReset: Date.now(),
    lastUpdate: Date.now(),
    lastLoaded: Date.now(),
  };
  context.board = { ...emptyBoard };
  context.resourceManager = genResourceManager(context, context.settings);

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

    load: () => _load(context, LocalStore.loadFromBrowser(_store)),
    loadAs: (loadStr: string) => _load(context, loadStr),

    save: (pretty?: boolean) =>
      LocalStore.saveToBrowser(_store, _save(context, pretty)),
    saveAs: (pretty?: boolean) => _save(context, pretty),

    reset: () => _reset(context),
  };
}

const _store = "Context";

function _load<Update>(
  context: Context<Update>,
  loadStr: string | null,
): boolean {
  const newContext = { ...context };
  const loaded = !!loadStr && Store.loadAs(newContext, loadStr);

  if (loaded) {
    let settingsKey: keyof typeof newContext.settings;
    for (settingsKey in newContext.settings) {
      assign(context.settings, settingsKey, newContext.settings[settingsKey]);
    }

    context.board = genBoardState({ ...context.board, ...newContext.board });
    Object.values(newContext.resourceManager.resources).forEach((res) =>
      context.resourceManager.upsert(res),
    );

    context.settings.lastLoaded = Date.now();
    context.resourceManager.update(undefined, "load");
  }

  return loaded;
}

function _save<Update>(context: Context<Update>, pretty?: boolean): string {
  context.settings.lastSaved = Date.now();
  return Store.saveAs(context, pretty);
}

function _reset<Update>(context: Context<Update>): void {
  LocalStore.resetOnBrowser(_store);
  emptyContext<Update>(context);
}
