import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import keyring from "@polkadot/ui-keyring";
import { web3FromSource } from "@polkadot/extension-dapp";
// import { createType } from "@polkadot/types";
import { u8aToHex, hexToU8a } from "@polkadot/util";
import baseX from "base-x";

// const config = {
//   DEV: true,
//   API: "ws://127.0.0.1:9944"
// };
const config = {
  DEV: false,
  API: "wss://substrate.ipci.io"
};

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bs58 = baseX(BASE58);

let instance = null;
let provider = null;

export function getProvider() {
  if (provider) {
    return provider;
  }
  provider = new WsProvider(config.API);
  // provider.on("error", () => {
  //   console.log("err");
  // });
  return provider;
}
export function getInstance() {
  if (instance) {
    return new Promise(function (resolve) {
      resolve(instance);
    });
  }
  return ApiPromise.create({
    provider: getProvider(),
    types: {
      Record: "Vec<u8>"
    }
  })
    .then((r) => {
      instance = r;
      return web3Enable("dapp");
    })
    .then(() => {
      return web3Accounts();
    })
    .then((accounts) => {
      return accounts.map(({ address, meta }) => ({
        address,
        meta
      }));
    })
    .then((injectedAccounts) => {
      keyring.loadAll(
        {
          addressPrefix: 42,
          genesisHash: instance.genesisHash,
          ss58Format: 42,
          isDevelopment: config.DEV,
          type: "ed25519"
          // type: "sr25519"
        },
        injectedAccounts
      );
      return instance;
    })
    .catch(() => {
      console.log("asdasd");
    });
}

export function hexToString(hex) {
  return bs58.encode(Buffer.from(hexToU8a(hex)));
}

export function getAccounts() {
  return keyring.getPairs();
}

export function getFirstAccounts() {
  const accounts = keyring.getPairs();
  return accounts[0].address;
}

export async function getAccount(substrate, address) {
  const account = keyring.getPair(address);
  if (account.meta.isInjected) {
    const injected = await web3FromSource(account.meta.source);
    substrate.setSigner(injected.signer);
    return account.address;
  }
  return account;
}

export async function sendSubstrate(substrate, account, result, cb, cbErr) {
  const record = u8aToHex(bs58.decode(result));

  const tx = substrate.tx.datalog.record(record);
  try {
    const unsub = await tx.signAndSend(account, (result) => {
      if (result.status.isFinalized) {
        cb(result.status.asFinalized.toString(), tx.hash.toString());
        unsub();
      }
    });
  } catch (error) {
    cbErr(error);
  }
}
