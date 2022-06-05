// Borrowed from github:RonPenton/tsc-utils

export type Null<T> = T extends null ? T : never;
export type Undefined<T> = T extends undefined ? T : never;
export type Nullable<T> = T | null | undefined;

export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;

export type Optional<T> = Nullable<
  T extends Primitive
    ? T
    : T extends (infer U)[]
    ? Optional<U>[]
    : { [P in keyof T]?: Optional<T[P]> }
>;

export type Replace<T, From, To> = T extends From
  ? To | Null<T> | Undefined<T>
  : NonNullable<T> extends From
  ? To | Null<T> | Undefined<T>
  : T extends Primitive
  ? T | Null<T> | Undefined<T>
  : T extends (infer U)[]
  ? Replace<U, From, To>[]
  : { [P in keyof T]: Replace<T[P], From, To> };
