function _storageAvailable(): boolean {
  const storage = window.localStorage;
  const x = "__storage_test__";

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // Acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0 &&
      (e.code === 22 || // Everything except Firefox
        e.code === 1014 || // Firefox
        // Also test the name field, because code might not be present
        e.name === "QuotaExceededError" || // Everything except Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") // Firefox
    );
  }
}

let _skipEncoding = false;
function _codec(s: string): string {
  if (_skipEncoding) {
    return s;
  }

  const h = s.startsWith("..");
  const c = (h ? s : Math.random().toString(36)).substring(2, 10);
  return (
    (h ? "" : ".." + c) +
    (h ? s.slice(10) : s)
      .split("")
      .map((s) => s.charCodeAt(0))
      .map((s, i) => String.fromCharCode(s ^ c.charCodeAt(i % 8)))
      .join("")
  );
}

export default abstract class store {
  static _skipEncoding() {
    _skipEncoding = true;
  }

  static saveAs(value: any): string {
    return window.btoa(_codec(JSON.stringify(value)));
  }

  static loadAs(value: string): any {
    return JSON.parse(_codec(window.atob(value)));
  }

  static reset(name: string): void {
    if (_storageAvailable()) {
      window.localStorage.removeItem(name);
    }
  }

  static save(name: string, value: any): boolean {
    if (_storageAvailable()) {
      const saveVal = store.saveAs(value);
      if (saveVal) {
        window.localStorage.setItem(name, saveVal);
        return true;
      }
    }

    return false;
  }

  static load(name: string): any {
    if (_storageAvailable()) {
      const saveVal = window.localStorage.getItem(name);
      if (saveVal) {
        try {
          return store.loadAs(saveVal);
        } catch (_) {}
      }
    }

    return null;
  }
}
