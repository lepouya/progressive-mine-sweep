import assign from "./assign";
import { FunctionType, Optional } from "./types";

export type Generator<T, Self = T, GenArgs extends unknown[] = []> =
  | (NonNullable<T> extends FunctionType ? never : Optional<T>)
  | ((self: Self, ...args: GenArgs) => Optional<T>);

export type Generative<T, GenArgs extends unknown[] = []> = {
  [Key in keyof T]?: Generator<T[Key], Optional<T>, GenArgs>;
};

export default function generate<
  T extends Record<any, unknown>,
  GenArgs extends unknown[] = any[],
>(
  generator?: Generative<T, GenArgs>,
  defaultValue?: Optional<T>,
  ...args: GenArgs
): T {
  const generated: any = { ...defaultValue };

  if (generator) {
    let key: keyof T;
    for (key in generator) {
      let value = generator[key];
      assign(
        generated,
        key,
        typeof value === "function" ? value(generated, ...args) : value,
      );
    }
  }

  return generated;
}
