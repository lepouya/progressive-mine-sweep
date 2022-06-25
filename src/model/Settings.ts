export type Settings = {
  // Clock settings
  ticksPerSecond: number;
  framesPerSecond: number;
  saveFrequencySecs: number;

  // Resource updates
  rateUpdateSecs: number;
  rateHistoryWindow: number;
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
  sellRatio: number;
  automationBaseSecs: number;
  timeDilation: number;

  // Game mode
  tutorialStep: number;
  tapMode: "reveal" | "flag";
  buyAmount: string;

  // Visuals
  theme?: string;
};

export const defaultSettings: Settings = {
  ticksPerSecond: 60.0,
  framesPerSecond: 10.0,
  saveFrequencySecs: 60.0,

  rateUpdateSecs: 1.0,
  rateHistoryWindow: 10,
  minResourceUpdateSecs: 0.001,
  maxResourceUpdateSecs: 86400.0,
  maxResourceTickSecs: 1.0,

  lastReset: Date.now(),
  lastUpdate: Date.now(),
  lastSaved: 0,
  lastLoaded: Date.now(),

  maxErrors: 1,
  sellRatio: 0.8,
  automationBaseSecs: 60.0,
  timeDilation: 1.0,

  tutorialStep: 0,
  tapMode: "reveal",
  buyAmount: "x1",

  theme: "",
};
