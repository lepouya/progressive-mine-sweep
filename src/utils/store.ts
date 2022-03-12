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

function _toObject<T>(value: T): any {
  const saveObj: Record<string, any> = {};

  let k: keyof typeof value;
  for (k in value) {
    const v = value[k];
    if (typeof v !== "function") {
      saveObj[k.toString()] = v;
    }
  }

  return saveObj;
}

function _fromObject<T>(value: T, loadObj: any): boolean {
  if (!loadObj) {
    return false;
  }

  let k: keyof typeof value;
  for (k in value) {
    if (typeof loadObj[k] === typeof value[k]) {
      value[k] = loadObj[k];
    }
  }

  return true;
}

const store = {
  skipEncoding() {
    _skipEncoding = true;
  },

  saveAs<T>(value: T): string {
    return window.btoa(_codec(JSON.stringify(_toObject(value))));
  },

  loadAs<T>(value: T, loadStr: string): boolean {
    return _fromObject(value, JSON.parse(_codec(window.atob(loadStr))));
  },

  reset(name: string): void {
    if (_storageAvailable()) {
      window.localStorage.removeItem(name);
    }
  },

  save<T>(name: string, value: T): boolean {
    if (_storageAvailable()) {
      const saveVal = store.saveAs(value);
      if (saveVal) {
        window.localStorage.setItem(name, saveVal);
        return true;
      }
    }

    return false;
  },

  load<T>(name: string, value: T): boolean {
    if (_storageAvailable()) {
      const saveVal = window.localStorage.getItem(name);
      if (saveVal) {
        try {
          return store.loadAs(value, saveVal);
        } catch (_) {}
      }
    }

    return false;
  },
};

export default store;
