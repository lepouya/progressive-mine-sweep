export type Optional<Type> = {
  [Property in keyof Type]+?: Type[Property];
};

export default Optional;
