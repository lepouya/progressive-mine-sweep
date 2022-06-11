export default function map<
  Key1 extends string | number | symbol,
  Value1,
  Key2 extends string | number | symbol = Key1,
  Value2 = Value1,
>(
  record: Record<Key1, Value1>,
  valueMap?: (value?: Value1, key?: Key1) => Value2,
  keyMap?: (key: Key1) => Key2,
): Record<Key2, Value2> {
  const newObject: any = {};

  for (const key in record) {
    const newKey = keyMap ? keyMap(key) : key;
    const value = record[key];
    const newValue = valueMap ? valueMap(value, key) : value;
    newObject[newKey] = newValue;
  }

  return newObject;
}
