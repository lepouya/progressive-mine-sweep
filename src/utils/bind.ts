export default function bind(_: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
  return {
    descriptor: true,
    get() {
      let value = descriptor.value.bind(this);
      Object.defineProperty(this, propertyKey, {
        value,
        configurable: true,
        writable: true
      });
      return value;
    },
  };
}