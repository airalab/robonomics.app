import {
  getContract,
  watchToken,
  getInfo,
  getBalance,
  watchBalance,
  getAllowance,
  watchAllowance,
  toChecksumAddress
} from "../../utils/token";
import filters from "@/utils/filters";

// initial state
const state = {
  list: {},
  balance: {},
  allowance: {}
};

// getters
const getters = {
  token: (state) => (token) => {
    token = toChecksumAddress(token);
    if (!state.list[token]) {
      return {
        name: "",
        decimals: 0,
        symbol: ""
      };
    }
    return state.list[token];
  },
  balance: (state) => (token, account) => {
    token = toChecksumAddress(token);
    account = toChecksumAddress(account);
    if (!state.balance[token] || !state.balance[token][account]) {
      return 0;
    }
    return state.balance[token][account];
  },
  balanceFormat: (state, getters) => (token, account) => {
    token = toChecksumAddress(token);
    account = toChecksumAddress(account);
    const balance = getters.balance(token, account);
    const info = getters.token(token);
    return filters.fromWei(
      balance,
      info ? info.decimals : 0,
      info ? info.symbol : ""
    );
  },
  allowance: (state) => (token, from, to) => {
    token = toChecksumAddress(token);
    from = toChecksumAddress(from);
    to = toChecksumAddress(to);
    if (
      !state.allowance[token] ||
      !state.allowance[token][from] ||
      !state.allowance[token][from][to]
    ) {
      return 0;
    }
    return state.allowance[token][from][to];
  },
  allowanceFormat: (state, getters) => (token, from, to) => {
    token = toChecksumAddress(token);
    from = toChecksumAddress(from);
    to = toChecksumAddress(to);
    const allowance = getters.allowance(token, from, to);
    const info = getters.token(token);
    return filters.fromWei(
      allowance,
      info ? info.decimals : 0,
      info ? info.symbol : ""
    );
  }
};

// actions
const actions = {
  add({ commit, dispatch, state, rootGetters }, address) {
    if (state.list[address]) {
      return;
    }
    commit("add", address);
    const token = getContract(address);
    watchToken(
      token,
      (result) => {
        if (rootGetters["wait/is"]("tx." + result.transactionHash)) {
          dispatch("wait/end", "tx." + result.transactionHash, {
            root: true
          });
        }
      },
      (_, account, value) => {
        dispatch("setBalance", { token: token.address, account, value });
      },
      (_, from, to, value) => {
        dispatch("setAllowance", { token: token.address, from, to, value });
      }
    );
    getInfo(token).then((info) => {
      dispatch("setInfo", { address: token.address, info });
    });
  },
  setInfo({ commit }, { address, info }) {
    commit("info", { address, info });
  },
  watchBalance({ dispatch, state }, { token, account }) {
    token = toChecksumAddress(token);
    account = toChecksumAddress(account);
    if (state.balance[token] && state.balance[token][account]) {
      return;
    }
    watchBalance(token, account);
    getBalance(getContract(token), account).then((value) => {
      dispatch("setBalance", { token, account, value });
    });
  },
  watchAllowance({ dispatch, state }, { token, from, to }) {
    token = toChecksumAddress(token);
    from = toChecksumAddress(from);
    to = toChecksumAddress(to);
    if (
      state.balance[token] &&
      state.balance[token][from] &&
      state.balance[token][from][to]
    ) {
      return;
    }
    watchAllowance(token, from, to);
    getAllowance(getContract(token), from, to).then((value) => {
      dispatch("setAllowance", { token, from, to, value });
    });
  },
  setBalance({ commit }, { token, account, value }) {
    token = toChecksumAddress(token);
    account = toChecksumAddress(account);
    commit("balance", { token, account, value });
  },
  setAllowance({ commit }, { token, from, to, value }) {
    token = toChecksumAddress(token);
    from = toChecksumAddress(from);
    to = toChecksumAddress(to);
    commit("allowance", { token, from, to, value });
  }
};

// mutations
const mutations = {
  add(state, address) {
    state.list = {
      ...state.list,
      [address]: {
        name: "",
        decimals: 0,
        symbol: ""
      }
    };
  },
  info(state, { address, info }) {
    state.list = {
      ...state.list,
      [address]: info
    };
  },
  balance(state, { token, account, value }) {
    state.balance = {
      ...state.balance,
      [token]: {
        ...state.balance[token],
        [account]: value
      }
    };
  },
  allowance(state, { token, from, to, value }) {
    state.allowance = {
      ...state.allowance,
      [token]: {
        ...state.allowance[token],
        [from]: {
          [to]: value
        }
      }
    };
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
