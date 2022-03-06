import store from "../utils/store";
import { emptyBoard } from "./Playboard";

const _saveStoreName = "Settings";

const Settings = {
  referenceMineFieldSize: 640,
  ticksPerSecond: 1,

  lastReset: Date.now(),
  lastUpdate: 0,
  lastSaved: 0,
  lastLoaded: 0,

  maxErrors: 1,
  mainPlayboard: emptyBoard,

  Save(): boolean {
    const saveObj: Record<string, any> = {};
    let k: keyof typeof Settings;
    for (k in Settings) {
      const v = Settings[k];
      if (typeof v !== "function") {
        saveObj[k] = v;
      }
    }

    if (!store.save(_saveStoreName, saveObj)) {
      return false;
    }

    this.lastSaved = Date.now();
    return true;
  },

  Load(): boolean {
    const loadObj = store.load(_saveStoreName);
    if (!loadObj) {
      return false;
    }

    let k: keyof typeof Settings;
    for (k in Settings) {
      if (typeof loadObj[k] === typeof Settings[k]) {
        Settings[k] = loadObj[k];
      }
    }

    this.lastLoaded = Date.now();
    return true;
  },

  Reset(): void {
    store.reset(_saveStoreName);
    // TODO: reset everything
    this.lastReset = Date.now();
  },
};

export default Settings;
