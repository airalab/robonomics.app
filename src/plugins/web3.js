import Vue from "vue";
import Web3 from "web3";

const CodeError = {
  PROVIDER: 4,
  NETWORK: 1,
  ACCOUNT: 2
};

class Web3Error extends Error {
  constructor(code = null, ...params) {
    super(...params);
    this.code = code;
  }
}

class Wallet {
  async activate() {}
  async getProvider() {}
  async getAccount() {}
  async getNetworkId() {}
}

class Metamask extends Wallet {
  constructor(update) {
    super();
    this.name = "metamask";
    this.account = null;
    this.networkId = null;
    this.update = update;
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
  }

  handleAccountsChanged(accounts) {
    if (accounts.length > 0) {
      this.account = accounts[0];
    } else {
      this.account = null;
    }
    this.update("accountsChanged", { account: this.account });
  }
  handleChainChanged(networkId) {
    this.networkId = Number(networkId);
    this.update("chainChanged", { networkId: this.networkId });
  }
  handleDisconnect() {
    this.account = null;
    this.update("disconnect");
  }
  async activate() {
    if (!window.ethereum) {
      throw new Web3Error(CodeError.PROVIDER, "Not found metamask");
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      return true;
    } catch (_) {
      return false;
    }
  }
  async getProvider() {
    if (window.ethereum) {
      window.ethereum.autoRefreshOnNetworkChange = false;
      window.ethereum.on("accountsChanged", this.handleAccountsChanged);
      window.ethereum.on("chainChanged", this.handleChainChanged);
      window.ethereum.on("disconnect", this.handleDisconnect);
      return window.ethereum;
    }
    throw new Web3Error(CodeError.PROVIDER, "Not found metamask");
  }
  async getNetworkId() {
    this.networkId = Number(
      await window.ethereum.request({ method: "eth_chainId" })
    );
    return this.networkId;
  }
  async getAccount() {
    if (!window.ethereum) {
      throw new Web3Error(CodeError.PROVIDER, "Not found metamask");
    }
    const accounts = await window.ethereum.request({
      method: "eth_accounts"
    });
    if (accounts.length > 0) {
      this.account = accounts[0];
      return this.account;
    }
    throw new Web3Error(CodeError.ACCOUNT, "You need to unblock metamask");
  }
  async isAuthorized() {
    if (!window.ethereum) {
      return false;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts"
      });
      return !!accounts.length;
    } catch (_) {
      return false;
    }
  }
}

class Infura extends Wallet {
  constructor({ networkId = 1, key = "" }) {
    super();
    this.name = "infura";
    this.account = null;
    this.networkId = networkId;
    this.key = key;
  }
  async activate() {
    throw new Web3Error(CodeError.PROVIDER, "Not found metamask");
  }
  async getProvider() {
    if (this.networkId === 1) {
      return "wss://mainnet.infura.io/ws/v3/" + this.key;
    } else if (this.networkId === 4) {
      return "wss://rinkeby.infura.io/ws/v3/" + this.key;
    }
    throw new Web3Error(CodeError.PROVIDER, "Bad config for infura");
  }
  async getAccount() {
    return null;
  }
  async getNetworkId() {
    return this.networkId;
  }
}

const state = Vue.observable({
  isReady: false,
  error: null,
  account: null,
  networkId: null
});
export const getters = {
  isReady: () => state.isReady,
  error: () => state.error,
  account: () => state.account,
  networkId: () => state.networkId
};

class Provider {
  constructor({ networks = [] } = {}) {
    this.library = null;
    this.signer = null;
    this.networks = networks;

    this.isReady = getters.isReady;
    this.error = getters.error;
    this.account = getters.account;
    this.networkId = getters.networkId;

    this.on = this.on.bind(this);
  }
  async setSigner(signer) {
    this.library = new Web3(await signer.getProvider());
    this.signer = signer;
  }
  on() {
    state.account = this.signer.account;
    state.networkId = this.signer.networkId;
    if (!this.networks.includes(state.networkId)) {
      state.error = new Web3Error(
        CodeError.NETWORK,
        "Please, switch to Mainnet"
      );
    } else {
      state.error = null;
    }
  }
  async init(config) {
    this.networks = config.networks;
    try {
      await this.setSigner(new Metamask(this.on));
      if (await this.signer.isAuthorized()) {
        state.account = await this.signer.getAccount();
      }
    } catch (error) {
      console.warn(error.message);
      // this.error = error;
      try {
        await this.setSigner(new Infura(config.infura));
      } catch (error) {
        state.error = error;
      }
    }
    try {
      state.networkId = await this.signer.getNetworkId();
      if (!this.networks.includes(state.networkId)) {
        state.error = new Web3Error(
          CodeError.NETWORK,
          "Please, switch to Mainnet"
        );
      }
    } catch (error) {
      state.error = error;
    }

    state.isReady = true;
  }
  async initAccount() {
    try {
      if (await this.signer.activate()) {
        state.account = await this.signer.getAccount();
      }
    } catch (error) {
      state.error = error;
    }
  }
}

export const $web3 = new Provider();

export default function () {
  Vue.prototype.$web3 = $web3;
}
