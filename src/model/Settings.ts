export type Settings = {
  // Clock settings
  ticksPerSecond: number;
  framesPerSecond: number;
  saveFrequencySecs: number;

  // Resource updates
  rateUpdateSecs: number;
  minResourceUpdateSecs: number;
  maxResourceUpdateSecs: number;
  maxResourceTickSecs: number;

  // Time tracking
  lastReset: number;
  lastUpdate: number;
  lastSaved: number;
  lastLoaded: number;

  // Game settings
  maxErrors: number;
  timeDilation: number;

  // Game mode
  tutorialStep: number;
  tapMode: "reveal" | "flag";
  buyAmount: string;
};

export const defaultSettings: Settings = {
  ticksPerSecond: 60.0,
  framesPerSecond: 10.0,
  saveFrequencySecs: 60.0,

  rateUpdateSecs: 1.0,
  minResourceUpdateSecs: 0.001,
  maxResourceUpdateSecs: 86400.0,
  maxResourceTickSecs: 1.0,

  lastReset: Date.now(),
  lastUpdate: Date.now(),
  lastSaved: 0,
  lastLoaded: Date.now(),

  maxErrors: 1,
  timeDilation: 1.0,

  tutorialStep: 0,
  tapMode: "reveal",
  buyAmount: "x1",
};
