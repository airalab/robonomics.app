import Vue from 'vue';
import { getContract, watchToken, getInfo, getBalance, watchBalance, getAllowance, watchAllowance } from '../../utils/token';

// initial state
const state = {
  list: {},
  balance: {},
  allowance: {}
};

// getters
const getters = {
  token: state => token => {
    if (!state.list[token]) {
      return null
    }
    return state.list[token]
  },
  balance: state => (token, account) => {
    if (!state.balance[token] || !state.balance[token][account]) {
      return 0
    }
    return state.balance[token][account]
  },
  balanceFormat: (state, getters) => (token, account) => {
    const balance = getters.balance(token, account);
    const info = getters.token(token);
    return Vue.options.filters.fromWei(
      balance,
      info ? info.decimals : 0,
      info ? info.symbol : ""
    );
  },
  allowance: state => (token, from, to) => {
    if (!state.allowance[token] || !state.allowance[token][from] || !state.allowance[token][from][to]) {
      return 0
    }
    return state.allowance[token][from][to]
  },
  allowanceFormat: (state, getters) => (token, from, to) => {
    const allowance = getters.allowance(token, from, to);
    const info = getters.token(token);
    return Vue.options.filters.fromWei(
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
      return
    }
    commit('add', address);
    const token = getContract(address)
    watchToken(token, (result) => {
      if (rootGetters['wait/is']('tx.' + result.transactionHash)) {
        dispatch('wait/end', 'tx.' + result.transactionHash, {
          root: true
        });
      }
    }, (_, account, value) => {
      dispatch('setBalance', { token: address, account, value });
    }, (_, from, to, value) => {
      dispatch('setAllowance', { token: address, from, to, value });
    })
    getInfo(token).then(info => {
      dispatch('setInfo', { address, info })
    })
  },
  setInfo({ commit }, { address, info }) {
    commit('info', { address, info });
  },
  watchBalance({ dispatch, state }, { token, account }) {
    if (state.balance[token] && state.balance[token][account]) {
      return
    }
    watchBalance(token, account)
    getBalance(getContract(token), account).then((value) => {
      dispatch('setBalance', { token, account, value });
    });
  },
  watchAllowance({ dispatch, state }, { token, from, to }) {
    if (state.balance[token] && state.balance[token][from] && state.balance[token][from][to]) {
      return
    }
    watchAllowance(token, from, to)
    getAllowance(getContract(token), from, to).then((value) => {
      dispatch('setAllowance', { token, from, to, value });
    });
  },
  setBalance({ commit }, { token, account, value }) {
    commit('balance', { token, account, value });
  },
  setAllowance({ commit }, { token, from, to, value }) {
    commit('allowance', { token, from, to, value });
  },
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
    }
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
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
