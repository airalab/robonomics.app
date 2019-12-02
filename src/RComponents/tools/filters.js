import { number } from "./utils";

export function urlExplorer(address, type = "address", chainid = 1) {
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

export function urlIpfs(hash, type = "ipfs") {
  const domain = "ipfs.io";
  if (type === "") {
    type = "ipfs";
  }
  return `https://${domain}/${type}/${hash}`;
}

export function fromWei(amount, decimals, currency = "") {
  return `${number.fromWei(amount, decimals)}${currency ? " " : ""}${currency}`;
}

export const labelAddress = text => {
  return text.slice(0, 6) + "..." + text.slice(-4);
};
