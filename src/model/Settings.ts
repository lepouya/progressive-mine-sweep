import store from "../utils/store";
import { emptyBoard } from "./Playboard";

const _saveStoreName = "Settings";

const Settings = {
  referenceMineFieldSize: 640,

  ticksPerSecond: 20,
  saveFrequencySecs: 60,

  lastReset: Date.now(),
  lastUpdate: 0,
  lastSaved: 0,
  lastLoaded: 0,

  maxErrors: 1,
  mainPlayboard: emptyBoard,

  Save(): boolean {
    return store.save(_saveStoreName, this.toObject());
  },

  Load(): boolean {
    return this.fromObject(store.load(_saveStoreName));
  },

  Reset(): void {
    store.reset(_saveStoreName);
    // TODO: reset everything
    this.lastReset = Date.now();
  },

  toObject(): any {
    const saveObj: Record<string, any> = {};
    this.lastSaved = Date.now();

    let k: keyof typeof Settings;
    for (k in Settings) {
      const v = Settings[k];
      if (typeof v !== "function") {
        saveObj[k] = v;
      }
    }

    return saveObj;
  },

  fromObject(loadObj: any): boolean {
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
};

export default Settings;
