import Decimal from "decimal.js-light";

Decimal.set({
  toExpNeg: -31,
  toExpPos: 31
});

export function fromUnit(v, decimals) {
  return new Decimal(v.toString())
    .div(new Decimal(10).pow(decimals.toString()))
    .toString();
}

export function toUnit(v, decimals) {
  return new Decimal(v.toString())
    .mul(new Decimal(10).pow(decimals.toString()))
    .toString();
}
