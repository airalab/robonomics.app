import Robonomics, { MessageProviderIpfs } from "robonomics-js";

let robonomics = null;
export function init(config, web3, ipfs) {
  robonomics = new Robonomics({
    web3,
    messageProvider: new MessageProviderIpfs(ipfs),
    ...config
  });
  return robonomics;
}

export default function() {
  if (robonomics === null) {
    throw new Error("Robonomics not init");
  }
  return robonomics;
}
