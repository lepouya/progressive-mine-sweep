export default function assign<
  Record,
  Key extends keyof Record,
  Value extends Record[Key],
>(record: Record, key: Key, value: Value) {
  if (value !== undefined && value !== null) {
    record[key] = value;
  }
}
