import { ApiPromise, WsProvider } from "@polkadot/api";
import { u8aToString } from "@polkadot/util";

const config = {
  API: "wss://substrate.ipci.io"
};

let instance = null;

export function getInstance() {
  if (instance) {
    return new Promise(function (resolve) {
      resolve(instance);
    });
  }
  const provider = new WsProvider(config.API);
  return ApiPromise.create({
    provider,
    types: {
      Record: "Vec<u8>"
    }
  }).then((r) => {
    instance = r;
    return r;
  });
}

export function toIpfsHash(data) {
  return u8aToString(data);
}
