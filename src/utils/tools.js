import { logger } from "@/utils/logger";
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
  logger.info(
    "Build version:",
    import.meta.env.VITE_APP_GIT_BRANCH,
    import.meta.env.VITE_APP_GIT_TAG,
    import.meta.env.VITE_APP_GIT_SHA
  );
}
