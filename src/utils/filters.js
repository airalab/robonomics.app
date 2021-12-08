import Decimal from "decimal.js-light";
import moment from "moment";

function urlChainExplorer(address, type = "address", chainid = 1) {
  let domain = "etherscan.io";
  if (type === "") {
    type = "address";
  }
  if (chainid === 4451) {
    domain = "explorer.aira.life";
    if (type === "address") {
      type = "addr";
    }
  } else {
    let chain = "";
    if (chainid === 4) {
      chain = "rinkeby.";
    }
    domain = chain + domain;
  }
  return `https://${domain}/${type}/${address}`;
}

function urlIpfsExplorer(hash, type = "ipfs") {
  const domain = "ipfs.io";
  if (type === "") {
    type = "ipfs";
  }
  return `https://${domain}/${type}/${hash}`;
}

function labelAddress(text) {
  return text.slice(0, 6) + "..." + text.slice(-4);
}

function fromUnit(v, decimals = 0) {
  return new Decimal(v.toString())
    .div(new Decimal(10).pow(decimals.toString()))
    .toString();
}

function toUnit(v, decimals = 0) {
  return new Decimal(v.toString())
    .mul(new Decimal(10).pow(decimals.toString()))
    .toString();
}

function fromWei(amount, decimals, currency = "", fixed = 0) {
  let value = fromUnit(amount, decimals);
  if (fixed > 0) {
    const index = value.indexOf(".");
    if (index >= 0) {
      value = value.substr(0, index + fixed + 1);
    }
  }
  return `${value}${currency ? " " : ""}${currency}`;
}

function dateFormat(v, format = "DD.MM.YYYY HH:mm:ss") {
  return moment(v, "X").format(format);
}

export default {
  urlChainExplorer: urlChainExplorer,
  urlIpfsExplorer: urlIpfsExplorer,
  fromUnit: fromUnit,
  toUnit: toUnit,
  fromWei: fromWei,
  labelAddress: labelAddress,
  dateFormat: dateFormat
};
