import store from "../utils/store";
import { emptyBoard } from "./Playboard";

const _saveStoreName = "Settings";
export default class Settings {
  static lastUpdate = 0;
  static ticksPerSecond = 1;

  static referenceMineFieldSize = 640;

  static maxErrors = 1;
  static mainPlayboard = emptyBoard;

  static Reset(): void {
    store.reset(_saveStoreName);
  }

  static Save(): boolean {
    return store.save(_saveStoreName, {
      lastUpdate: this.lastUpdate,
      ticksPerSecond: this.ticksPerSecond,
      referenceMineFieldSize: this.referenceMineFieldSize,
      maxErrors: this.maxErrors,
      mainPlayboard: this.mainPlayboard,
    });
  }

  static Load(): boolean {
    const obj = store.load(_saveStoreName);
    if (!obj) {
      return false;
    }

    if (obj.lastUpdate && typeof obj.lastUpdate === "number") {
      this.lastUpdate = obj.lastUpdate;
    }

    if (obj.ticksPerSecond && typeof obj.ticksPerSecond === "number") {
      this.ticksPerSecond = obj.ticksPerSecond;
    }

    if (
      obj.referenceMineFieldSize &&
      typeof obj.referenceMineFieldSize === "number"
    ) {
      this.referenceMineFieldSize = obj.referenceMineFieldSize;
    }

    if (obj.maxErrors && typeof obj.maxErrors === "number") {
      this.maxErrors = obj.maxErrors;
    }

    if (obj.mainPlayboard && typeof obj.mainPlayboard === "object") {
      this.mainPlayboard = obj.mainPlayboard;
    }

    return true;
  }
}
