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

export function resetOnBrowser(fileName: string): void {
  if (_storageAvailable()) {
    window.localStorage.removeItem(fileName);
  }
}

export function saveToBrowser(fileName: string, contents: string | null) {
  if (_storageAvailable() && contents) {
    window.localStorage.setItem(fileName, contents);
  }
}

export function loadFromBrowser(fileName: string): string | null {
  if (_storageAvailable()) {
    return window.localStorage.getItem(fileName);
  } else {
    return null;
  }
}
