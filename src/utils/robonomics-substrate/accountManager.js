import {
  web3Accounts,
  web3Enable,
  web3FromSource
} from "@polkadot/extension-dapp";
import keyring from "@polkadot/ui-keyring";
import { encodeAddress } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";

class ErrorAccount extends Error {
  constructor(status = null, ...params) {
    super(...params);
    this.status = status;
  }
}

function onLoad() {
  return new Promise(function (resolve, reject) {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      clearInterval(interval);
      return reject(new ErrorAccount(1, "Not fount polkadot.extension"));
    }, 3000);
    const interval = setInterval(() => {
      if (Object.keys(window.injectedWeb3).length > 0) {
        clearTimeout(timeout);
        clearInterval(interval);
        return resolve();
      }
    }, 100);
  });
}

let isReady = false;
let isError = undefined;
export default class AccountManager {
  constructor(config = {}) {
    this.api = null;
    this.config = config;
    this.account = null;
    this.listeners = [];
  }
  setApi(api) {
    this.api = api;
  }
  static async initPlugin(config = {}) {
    if (isReady) {
      return;
    }
    try {
      await onLoad();
      const extensions = await web3Enable("robonomics");
      if (extensions.length === 0) {
        throw new ErrorAccount(2, "no extension");
      }
      const accounts = await web3Accounts();
      const injectedAccounts = accounts.map(({ address, meta }) => ({
        address,
        meta
      }));
      keyring.loadAll(
        {
          ...config
        },
        injectedAccounts
      );
      isReady = true;
    } catch (error) {
      isError = error;
      throw error;
    }
  }
  static isReady() {
    return isReady;
  }
  static isError() {
    return isError;
  }
  onReady(cb) {
    if (isReady || isError) {
      cb(isError);
    } else {
      setTimeout(() => {
        this.onReady(cb);
      }, 1000);
    }
  }
  getAccounts() {
    const pairs = keyring.getPairs();
    return pairs.map((pair) => {
      return {
        ...pair,
        address: encodeAddress(
          pair.address,
          this.config.ss58Format || this.api.registry.chainSS58
        )
      };
    });
  }
  async selectAccountByAddress(address) {
    const account = keyring.getPair(address);
    this.account = {
      ...account,
      address: encodeAddress(
        account.address,
        this.config.ss58Format || this.api.registry.chainSS58
      )
    };
    if (this.account.meta.isInjected) {
      const injected = await web3FromSource(this.account.meta.source);
      this.api.setSigner(injected.signer);

      this.account.signMsg = async function (data) {
        return (
          await injected.signer.signRaw({
            address: account.address,
            data: u8aToHex(data),
            type: "bytes"
          })
        ).signature;
      };
    } else {
      this.account.signMsg = async function (data) {
        return Promise.resolve(u8aToHex(account.sign(data)));
      };
    }
    for (const cb of this.listeners) {
      cb(this.account);
    }
    return this.account;
  }
  onChange(cb) {
    this.listeners.push(cb);
    return () => {
      const i = this.listeners.indexOf(cb);
      this.listeners.splice(i, 1);
    };
  }
  async signAndSend(tx, options = {}) {
    if (this.account === null) {
      throw new ErrorAccount(3, "No account selected");
    }
    return new Promise((resolve, reject) => {
      tx.signAndSend(
        this.account.meta.isInjected ? this.account.address : this.account,
        options,
        (result) => {
          if (result.status.isInBlock) {
            result.events.forEach(async (events) => {
              const {
                event: { data, method, section },
                phase
              } = events;
              if (section === "system" && method === "ExtrinsicFailed") {
                let message = "Error";
                if (data[0].isModule) {
                  const mod = data[0].asModule;
                  // const mod = result.dispatchError.asModule;
                  const { docs, name, section } = mod.registry.findMetaError(
                    mod
                  );
                  console.log(name, section, docs);
                  message = docs.join(", ");
                }
                return reject(new ErrorAccount(4, message));
              } else if (
                section === "system" &&
                method === "ExtrinsicSuccess"
              ) {
                const block = await this.api.rpc.chain.getBlock(
                  result.status.asInBlock.toString()
                );
                resolve({
                  block: result.status.asInBlock.toString(),
                  blockNumber: block.block.header.number.toNumber(),
                  // const index = phase.value.toNumber();
                  txIndex: phase.asApplyExtrinsic.toHuman(),
                  tx: tx.hash.toString()
                });
              }
            });
          }
        }
      ).catch(reject);
    });
  }
}
