export type Settings = {
  ticksPerSecond: number;
  saveFrequencySecs: number;
  lastReset: number;
  lastUpdate: number;
  lastSaved: number;
  lastLoaded: number;
  maxErrors: number;
};

export const emptySettings = {
  ticksPerSecond: 20,
  saveFrequencySecs: 60,
  lastReset: Date.now(),
  lastUpdate: 0,
  lastSaved: 0,
  lastLoaded: Date.now(),
  maxErrors: 1,
};
