import { emptyBoard } from "./Playboard";

export default class Settings {
  static lastUpdate = 0;
  static ticksPerSecond = 20;

  static ReferenceMineFieldSize = 640;

  static maxErrors = 1;
  static mainPlayboard = emptyBoard;
}
