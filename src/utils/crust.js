import { typesBundleForPolkadot } from "@crustio/type-definitions";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";

export class Crust {
  constructor(endpoint) {
    this.isReady = false;
    this.init(endpoint);
  }

  watch(cb) {
    if (this.isReady) {
      cb();
      return;
    }
    const intervalId = setInterval(() => {
      if (this.isReady) {
        clearInterval(intervalId);
        cb();
        return;
      }
    }, 100);
  }

  async init(endpoint) {
    this.provider = new WsProvider(endpoint);
    this.api = await ApiPromise.create({
      provider: this.provider,
      typesBundle: typesBundleForPolkadot
    });
    await cryptoWaitReady();
    this.isReady = true;
  }

  async getBalance(account, cb) {
    if (!cb) {
      const { data } = await this.api.query.system.account(account);
      return data.free.sub(data.feeFrozen).toNumber();
    }
    return this.api.query.system.account(account, ({ data }) => {
      cb(data.free.sub(data.feeFrozen).toNumber());
    });
  }

  async getStorePrice(file_size) {
    const fileBaseFee = await this.api.query.market.fileBaseFee();
    const fileByteFee = await this.api.query.market.fileByteFee();
    return Math.round(
      fileBaseFee.toNumber() + (fileByteFee.toNumber() * file_size) / 1024 ** 2
    );
  }

  async getInfo(ipfs_cid) {
    return await this.api.query.market.filesV2(ipfs_cid);
  }

  addRenewalPoolBalance(ipfs_cid, amount) {
    return this.api.tx.market.addPrepaid(ipfs_cid, amount);
  }

  storeFile(ipfs_cid, file_size, tips = 0) {
    return this.api.tx.market.placeStorageOrder(ipfs_cid, file_size, tips, "");
  }

  async signAndSend(account, tx, options = {}) {
    return new Promise((resolve, reject) => {
      tx.signAndSend(
        account.meta.isInjected ? account.address : account,
        options,
        (result) => {
          if (result.status.isInBlock) {
            result.events.forEach(async (events) => {
              const {
                event: { method, section },
                phase
              } = events;
              if (section === "system" && method === "ExtrinsicFailed") {
                let message = "Error";
                if (result.dispatchError?.isModule) {
                  const mod = result.dispatchError.asModule;
                  const { docs, name, section } =
                    mod.registry.findMetaError(mod);
                  console.log(name, section, docs);
                  message = docs.join(", ");
                }
                return reject(new Error(message));
              } else if (
                section === "system" &&
                method === "ExtrinsicSuccess"
              ) {
                let blockNumber;
                if (this.api) {
                  const block = await this.api.rpc.chain.getBlock(
                    result.status.asInBlock.toString()
                  );
                  blockNumber = block.block.header.number.toNumber();
                }
                resolve({
                  block: result.status.asInBlock.toString(),
                  blockNumber: blockNumber,
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
