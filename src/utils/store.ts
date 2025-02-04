import dedupe from "./dedupe";

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
      value[k] != null &&
      (saveProperties.length === 0 || saveProperties.includes(k))
    ) {
      const v = value[k];
      if (typeof v === "object") {
        const res = _toObject(v);
        if (res != null) {
          saveObj[k.toString()] = res;
        }
      } else if (typeof v !== "function") {
        saveObj[k.toString()] = v;
      }
    }
  }

  return saveObj;
}

function _fromObject<T>(value: T, loadObj: any): boolean {
  if (
    !value ||
    !loadObj ||
    typeof loadObj !== "object" ||
    typeof value !== "object"
  ) {
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

export function setSaveProperties<T>(value: T, props: (keyof T)[]): T {
  if (!value || typeof value !== "object") {
    return value;
  }
  const saveProperties = _save_properties(value);
  saveProperties.push(...props);
  Object.assign(value, { _save_properties: dedupe(saveProperties) });
  return value;
}
