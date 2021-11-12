import { ApiPromise, WsProvider } from "@polkadot/api";

const instances = {};

export default class Robonomics {
  constructor(config) {
    this.config = config;
    this.api = null;
    this.provider = null;
    this.accountManager = null;
    this.isReady = false;
    this.modules = this.config.modules || [
      "account",
      "datalog",
      "launch",
      "rws",
      "staking"
    ];
    instances[config.name || config.endpoint] = this;
    this.init();
  }
  static getInstance(name = null) {
    if (name === null) {
      const instancesArray = Object.values(instances);
      if (instancesArray.length > 0) {
        return instancesArray[0];
      }
    }
    if (instances[name]) {
      return instances[name];
    }
    throw new Error(`Instance named ${name} not found`);
  }
  createProvider(endpoint) {
    this.provider = new WsProvider(endpoint);
  }
  async createApi(config) {
    this.api = await ApiPromise.create({
      provider: this.provider,
      ...config
    });
    for (const name of this.modules) {
      const module = require(`./modules/${name}`);
      this[name] = new module.default(this);
    }
  }
  onReady(cb) {
    if (this.isReady) {
      cb();
    } else {
      setTimeout(() => {
        this.onReady(cb);
      }, 100);
    }
  }
  async init() {
    if (this.api) {
      return;
    }
    this.createProvider(this.config.endpoint);
    await this.createApi(this.config.api);
    this.isReady = true;
    if (this.accountManager && this.accountManager.api === null) {
      this.accountManager.setApi(this.api);
    }
  }
  setAccountManager(accountManager) {
    if (this.api) {
      accountManager.setApi(this.api);
    }
    this.accountManager = accountManager;
  }
  async onBlock(cb) {
    return await this.api.rpc.chain.subscribeNewHeads((header) => {
      cb(header.number.toNumber());
    });
  }
  async on(filter = {}, cb) {
    return await this.api.query.system.events((events) => {
      // this.api.rpc.chain.getHeader(events.createdAtHash, (header) => {
      //   const blockNumber = header.number.toNumber();
      //   // const blockHash = header.hash.toHex();
      //   console.log(blockNumber);
      // });
      let result = {};
      events.forEach((record) => {
        const { event, phase } = record;
        if (phase.isNull) {
          return;
        }
        const index = phase.value.toNumber();
        if (
          event.section === filter.section &&
          (!filter.method || event.method === filter.method)
        ) {
          result[index] = {
            event: event.method,
            account: event.data[0].toString(),
            success: null,
            data: event.data.slice(1)
          };
        }
        if (event.section === "system" && result[index]) {
          if (event.method === "ExtrinsicSuccess") {
            result[index].success = true;
          } else if (event.method === "ExtrinsicFailed") {
            result[index].success = false;
          }
        }
      });
      result = Object.values(result);
      if (filter.account && result.length) {
        result = result.filter((item) => {
          if (item.account === filter.account) {
            return true;
          }
          return false;
        });
      }
      if (result.length) {
        cb(result);
      }
    });
  }
}
