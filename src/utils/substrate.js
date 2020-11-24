import { ApiPromise, WsProvider } from "@polkadot/api";
import keyring from "@polkadot/ui-keyring";
import {
  web3FromSource,
  web3Accounts,
  web3Enable
} from "@polkadot/extension-dapp";

// const config = {
//   url: "ws://127.0.0.1:9944",
//   types: {
//     Record: "Vec<u8>",
//   },
//   keyring: {
//     genesisHash: api.genesisHash,
//     ss58Format: 42,
//     isDevelopment: false,
//     type: "ed25519"
//   }
// };
const config = {
  url: "wss://substrate.ipci.io",
  types: {
    Record: "Vec<u8>"
  },
  keyring: {
    ss58Format: 32,
    isDevelopment: false,
    type: "ed25519"
  }
};

let api = null;
export async function getInstance() {
  if (api) {
    return api;
  }
  api = await ApiPromise.create({
    provider: new WsProvider(config.url),
    types: config.types
  });
  return api;
}

let isInitAccounts = false;
export async function initAccounts(api) {
  if (!isInitAccounts) {
    try {
      await web3Enable("dapp");
      const accounts = await web3Accounts();
      const injectedAccounts = accounts.map(({ address, meta }) => ({
        address,
        meta
      }));
      keyring.loadAll(
        {
          genesisHash: api.genesisHash,
          ...config.keyring
        },
        injectedAccounts
      );
      isInitAccounts = true;
    } catch (_) {
      // err
    }
  }
}

export function getAccounts() {
  return keyring.getPairs();
}

export function getFirstAddressAccount() {
  const accounts = keyring.getPairs();
  return accounts[0].address;
}

export async function getAccount(api, address) {
  const account = keyring.getPair(address);
  if (account.meta.isInjected) {
    const injected = await web3FromSource(account.meta.source);
    api.setSigner(injected.signer);
    return account.address;
  }
  return account;
}

export function send(api, account, data) {
  return new Promise((resolve, reject) => {
    const tx = api.tx.datalog.record(data);
    try {
      let unsubscribe;
      tx.signAndSend(account, {}, (result) => {
        if (result.status.isFinalized) {
          unsubscribe();
          resolve({
            block: result.status.asFinalized.toString(),
            tx: tx.hash.toString()
          });
        }
      }).then((r) => {
        unsubscribe = r;
      });
    } catch (error) {
      reject(error);
    }
  });
}
