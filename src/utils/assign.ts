export default function assign<
  T,
  Key extends keyof T = keyof T,
  Value extends T[Key] = T[Key],
>(record: T, key: Key, value?: Value) {
  if (record[key] && value && typeof value === "object") {
    record[key] = { ...record[key], ...value };
  } else if (value != undefined && value != null) {
    record[key] = value;
  }
}
