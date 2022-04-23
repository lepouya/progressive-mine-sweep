export const roundMethods = {
  floor: Math.floor,
  round: Math.round,
  ceil: Math.ceil,
};

export default function round(
  val: number,
  prec: number,
  round: keyof typeof roundMethods,
) {
  const exp = 10 ** prec;
  return roundMethods[round](val * exp) / exp;
}
