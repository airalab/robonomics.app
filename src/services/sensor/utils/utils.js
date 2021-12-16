import axios from "axios";
import { tools } from "@/utils/ipfs";
import rosBag from "@/utils/rosBag";
import { formatBalance as fb } from "@polkadot/util";
import Decimal from "decimal.js-light";
import config from "~config";

Decimal.set({
  toExpNeg: -31,
  toExpPos: 31
});

export async function parseResult(result, options = { topics: ["/data"] }) {
  axios.get(`${config.IPFS_GATEWAY}${result}`).then(() => {
    console.log("result ipfs hash resolved");
  });
  const r = await tools.cat(result);
  let message = {};
  await rosBag(
    new Blob([r]),
    function (bag) {
      try {
        message = JSON.parse(bag.message.data);
      } catch (error) {
        console.log(error);
      }
    },
    options
  );
  return message;
}

export function loadScript(src) {
  return new Promise(function (resolve, reject) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

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
  return new Decimal(v.toString())
    .mul(new Decimal(10).pow(decimals.toString()))
    .toString();
}
