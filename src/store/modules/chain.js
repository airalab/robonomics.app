import Web3 from "web3";
import config from "~config";

function getWeb3Provider() {
  if (window.ethereum) {
    return { type: 1, provider: window.ethereum };
  } else if (window.web3) {
    console.warn("warrning old metamask");
    return { type: 2, provider: window.web3.currentProvider };
  } else {
    console.log("web3 fallback");
    return {
      type: 3,
      provider: new Web3.providers.WebsocketProvider(
        "wss://mainnet.infura.io/ws/v3/" + config.INFURA_KEY
      ),
    };
  }
}

export async function getAccount(web3) {
  const accounts = await web3.eth.getAccounts();
  if (accounts.length > 0) {
    return web3.utils.toChecksumAddress(accounts[0]);
  }
  throw new Error("not account");
}

export async function accountAccess() {
  try {
    await window.ethereum.enable();
    return true;
  } catch (_) {
    return false;
  }
}

const initAccount = false;
const initAccessRequired = true;

// initial state
const state = {
  isReady: false,
  error: null,
  networkId: null,
  account: null,
  getWeb3: null,
  typeProvider: null,
};

// getters
const getters = {};

// actions
const actions = {
  async init({ commit }, networks) {
    try {
      const provider = getWeb3Provider();
      commit("typeProvider", provider.type);
      const instance = new Web3(provider.provider);
      commit("web3", instance);
      const networkId = await instance.eth.net.getId();
      commit("networkId", networkId);
      if (!networks.includes(String(networkId))) {
        commit("error", 1);
      } else {
        let error = 0;
        if (instance && provider.type === 1) {
          window.ethereum.on("networkChanged", function(networkId) {
            commit("networkId", networkId);
          });
          window.ethereum.on("accountsChanged", function(accounts) {
            if (accounts.length > 0) {
              commit("account", instance.utils.toChecksumAddress(accounts[0]));
            } else {
              commit("account", null);
            }
          });
          if (initAccount) {
            if (await accountAccess()) {
              try {
                commit("account", await getAccount(instance));
              } catch (_) {
                error = 2;
              }
            } else if (initAccessRequired) {
              error = 3;
              console.log("not access");
            }
          }
        } else if (instance && provider.type === 2) {
          try {
            commit("account", await getAccount(instance));
          } catch (_) {
            error = 2;
          }
        }
        if (error > 0) {
          commit("error", error);
        } else {
          commit("isReady", true);
        }
      }
    } catch (e) {
      console.log(e);
    }
  },
  async accessAccount({ commit, state }, isGlobal = true) {
    const instance = state.getWeb3();
    const typeProvider = state.typeProvider;
    let error = 0;
    if (instance && typeProvider === 1) {
      if (await accountAccess()) {
        try {
          commit("account", await getAccount(instance));
        } catch (_) {
          error = 2;
        }
      } else {
        error = 3;
        console.log("not access");
      }
    } else if (instance && typeProvider === 2) {
      try {
        commit("account", await getAccount(instance));
      } catch (_) {
        error = 2;
      }
    }
    if (isGlobal) {
      if (error > 0) {
        commit("error", error);
      } else {
        commit("isReady", true);
      }
    }
  },
};

// mutations
const mutations = {
  typeProvider(state, payload) {
    state.typeProvider = payload;
  },
  web3(state, payload) {
    state.getWeb3 = () => payload;
  },
  account(state, payload) {
    state.account = payload;
  },
  networkId(state, payload) {
    state.networkId = payload;
  },
  isReady(state, payload) {
    state.isReady = payload;
    state.error = null;
  },
  error(state, payload) {
    state.error = payload;
    state.isReady = false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
