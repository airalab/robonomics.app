import Decimal from "decimal.js-light";

Decimal.set({
  toExpNeg: -31,
  toExpPos: 31
});

export function toDecimal(v) {
  return new Decimal(v.toString());
}

export function round(v, place) {
  return toDecimal(v).todp(place);
}

export function fromUnit(v, decimals = 0, dp) {
  return toDecimal(v)
    .div(new Decimal(10).pow(decimals.toString()))
    .todp(dp)
    .toString();
}

export function toUnit(v, decimals = 0) {
  return toDecimal(v).mul(new Decimal(10).pow(decimals.toString())).toString();
}

export function showVersion() {
  console.log(
    "Build version:",
    process.env.VUE_APP_GIT_BRANCH,
    process.env.VUE_APP_GIT_TAG,
    process.env.VUE_APP_GIT_SHA
  );
}
