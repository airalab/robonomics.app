import Decimal from "decimal.js-light";

Decimal.set({
  toExpNeg: -31,
  toExpPos: 31
});

export function sliceAddress(text) {
  return text.slice(0, 6) + "..." + text.slice(-4);
}

export function toDecimal(v) {
  return new Decimal(v.toString());
}

export function fromUnit(v, decimals = 0) {
  return new Decimal(v.toString())
    .div(new Decimal(10).pow(decimals.toString()))
    .toString();
}

export function toUnit(v, decimals = 0) {
  return new Decimal(v.toString())
    .mul(new Decimal(10).pow(decimals.toString()))
    .toString();
}
