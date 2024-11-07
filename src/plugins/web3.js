import { ethers } from "ethers";
import { reactive } from "vue";

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

class Connector {
  async activate() {}
  async getProvider() {}
  async getAccount() {}
  async getNetworkId() {}
}

class Extension extends Connector {
  constructor(provider, update) {
    super();
    this.provider = provider;
    this.name = "extension";
    this.account = null;
    this.networkId = null;
    this.emit = update;
  }
  handleChainChanged(networkId) {
    this.networkId = Number(networkId);
    this.emit("chainChanged", { networkId: this.networkId });
  }
  async getProvider() {
    this.provider.on("accountsChanged", (accounts) => {
      this.handleAccountsChanged(accounts);
    });
    this.provider.on("chainChanged", (networkId) => {
      this.handleChainChanged(networkId);
    });
    return this.provider;
  }
  async getNetworkId() {
    this.networkId = Number(
      await this.provider.request({ method: "eth_chainId" })
    );
    return this.networkId;
  }
  handleAccountsChanged(accounts) {
    if (accounts.length > 0) {
      this.account = accounts[0];
    } else {
      this.account = null;
    }
    this.emit("accountsChanged", { account: this.account });
  }
}

class Provider {
  constructor({ networks = [] } = {}) {
    this.provider = null;
    this.connector = null;
    this.signer = null;
    this.networks = networks;

    this.state = reactive({
      isReady: false,
      error: null,
      account: null,
      networkId: null,
      block: null
    });
  }
  async setConnector(connector) {
    if (connector.name === "extension") {
      this.provider = new ethers.BrowserProvider(await connector.getProvider());
    } else {
      this.provider = new ethers.WebSocketProvider(
        await connector.getProvider()
      );
    }
    this.connector = connector;
    this.setSigner();
  }
  async setSigner() {
    if (this.connector && this.connector.name === "extension") {
      try {
        this.signer = await this.provider.getSigner();
        this.state.account = this.signer.address;
      } catch (error) {
        console.log(error);
      }
    }
  }
  on(name, data) {
    // if (name === "accountsChanged") {
    //   this.state.account = data.account;
    // }
    if (name === "chainChanged") {
      this.state.networkId = data.networkId;
    }
    if (!this.networks.includes(this.state.networkId)) {
      this.state.error = new Web3Error(
        CodeError.NETWORK,
        `sssPlease, switch to network id ${this.networks}`
      );
    } else {
      this.state.error = null;
    }
  }
  async setProvider(provider) {
    try {
      await this.setConnector(
        new Extension(provider, (name, data) => this.on(name, data))
      );
    } catch (error) {
      console.warn(error.message);
    }
    try {
      if (this.connector) {
        this.state.networkId = await this.connector.getNetworkId();
        if (!this.networks.includes(this.state.networkId)) {
          this.state.error = new Web3Error(
            CodeError.NETWORK,
            `Please, switch to network id ${this.networks}`
          );
        }
      }
    } catch (error) {
      this.state.error = error;
    }

    if (this.provider && this.state.error === null) {
      this.state.isReady = true;
      this.provider.on("block", async (blockNumber) => {
        this.state.block = await this.provider.getBlock(blockNumber);
      });
      this.state.block = await this.provider.getBlock("latest");
    }
  }
}

export const $web3 = new Provider({ networks: [11155111] });

export default {
  install: async (app) => {
    app.provide("EthereumProvider", {
      web3: $web3
    });
  }
};
