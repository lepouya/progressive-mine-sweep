import dedupe from "./dedupe";

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

function _save_properties<T>(obj: T): (keyof T)[] {
  const saveProperties: (keyof T)[] = [];
  const _save_properties = (<any>obj)["_save_properties"];
  if (
    _save_properties != null &&
    typeof _save_properties === "object" &&
    Array.isArray(_save_properties)
  ) {
    saveProperties.push(..._save_properties);
  }

  return saveProperties;
}

function _toObject<T>(value: T): any {
  if (!value || typeof value !== "object") {
    return value;
  } else if (Array.isArray(value)) {
    return value.map((e) => _toObject(e));
  } else if (Object.keys(value).length === 0) {
    // No need to save empty records
    return null;
  }

  const saveObj: Record<string, any> = {};
  const saveProperties = _save_properties(value);

  let k: keyof typeof value;
  for (k in value) {
    if (
      !k.startsWith("_") &&
      (saveProperties.length === 0 || saveProperties.includes(k))
    ) {
      const v = value[k];
      if (typeof v === "object") {
        saveObj[k.toString()] = _toObject(v);
      } else if (typeof v !== "function") {
        saveObj[k.toString()] = v;
      }
    }
  }

  return saveObj;
}

function _fromObject<T>(value: T, loadObj: any): boolean {
  if (!loadObj || typeof loadObj !== "object" || typeof value !== "object") {
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

export function skipEncoding() {
  _skipEncoding = true;
}

export function saveAs<T>(value: T, pretty = false): string {
  if (pretty) {
    return JSON.stringify(_toObject(value), null, 2);
  } else {
    return window.btoa(_codec(JSON.stringify(_toObject(value))));
  }
}

export function loadAs<T>(value: T, loadStr: string): boolean {
  let parsed: any = null;
  if (!parsed) {
    try {
      parsed = JSON.parse(_codec(window.atob(loadStr)));
    } catch (_) {
      parsed = null;
    }
  }
  if (!parsed) {
    try {
      parsed = JSON.parse(window.atob(loadStr));
    } catch (_) {
      parsed = null;
    }
  }
  if (!parsed) {
    try {
      parsed = JSON.parse(loadStr);
    } catch (_) {
      parsed = null;
    }
  }
  if (!parsed) {
    return false;
  }

  return _fromObject(value, parsed);
}

export function reset(name: string): void {
  if (_storageAvailable()) {
    window.localStorage.removeItem(name);
  }
}

export function save<T>(name: string, value: T, pretty = false): boolean {
  if (_storageAvailable()) {
    const saveVal = saveAs(value, pretty);
    if (saveVal) {
      window.localStorage.setItem(name, saveVal);
      return true;
    }
  }

  return false;
}

export function load<T>(name: string, value: T): boolean {
  if (_storageAvailable()) {
    const saveVal = window.localStorage.getItem(name);
    if (saveVal) {
      try {
        return loadAs(value, saveVal);
      } catch (_) {}
    }
  }

  return false;
}

export function setSaveProperties<T>(value: T, props: (keyof T)[]): T {
  const saveProperties = _save_properties(value);
  saveProperties.push(...props);
  Object.assign(value, { _save_properties: dedupe(saveProperties) });
  return value;
}
