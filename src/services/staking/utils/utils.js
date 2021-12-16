import { formatBalance as fb } from "@polkadot/util";
import Decimal from "decimal.js-light";

Decimal.set({
  toExpNeg: -31,
  toExpPos: 31
});

// packages/react-query/src/FormatBalance.tsx 59
// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1;
const K_LENGTH = 3 + 1;
function applyFormat(
  value,
  [decimals, token],
  withCurrency = true,
  withSi = false,
  _isShort = false
) {
  const [prefix, postfix] = fb(value, {
    decimals,
    forceUnit: "-",
    withSi: false
  }).split(".");

  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH);
  const unitPost = withCurrency ? token : "";

  if (prefix.length > M_LENGTH) {
    const [major, rest] = fb(value, {
      decimals,
      withUnit: false
    }).split(".");
    const minor = rest.substr(0, 4);
    const unit = rest.substr(4);

    return `${major}.${minor} ${unit.trim()}${unit ? unitPost : unitPost}`;
  }

  return `${prefix}${isShort ? "" : "."}${
    !isShort && `0000${postfix || ""}`.slice(-4)
  } ${unitPost}`;
}

export function formatBalance(v, decimals = 9, unit = "XRT", full = false) {
  if (full) {
    return fb(v.toString(), {
      decimals: decimals,
      withUnit: unit
      // withSi: true,
      /* withSi: true, forceUnit: "-"*/
    });
  }
  return applyFormat(v.toString(), [decimals, unit]).replace(",", "");
}

export function toUnit(v, decimals) {
  return new Decimal(v?.toString() || 0)
    .mul(new Decimal(10).pow(decimals.toString()))
    .toString();
}

export function toDecimal(v) {
  return new Decimal(v?.toString() || 0);
}
