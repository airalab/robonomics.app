import { promisify } from '../../utils/utils';
import config from '../../config';
import ABI_TOKEN from '../../abi/Token.json';

const getBalanceToken = async (account, address) => {
  const token = web3.eth.contract(ABI_TOKEN).at(address);
  const balanceOfFn = promisify(token.balanceOf);
  return Number(await balanceOfFn([account]));
};

const getApproveToken = async (account, to, address) => {
  const token = web3.eth.contract(ABI_TOKEN).at(address);
  const allowanceFn = promisify(token.allowance);
  return Number(await allowanceFn([account, to]));
};

// initial state
const state = {
  run: false,
  tokens: {}
};

// getters
const getters = {};

// actions
const actions = {
  async init({ commit, state, dispatch, rootGetters }, { account, networkId }) {
    if (state.run) {
      return;
    }
    commit('run');
    dispatch('setTokens', networkId);
    dispatch('getBalance', account);
    Object.values(state.tokens).forEach(item => {
      const contract = web3.eth.contract(ABI_TOKEN);
      const token = contract.at(item.address);
      const events = token.allEvents({});
      events.watch((error, result) => {
        if (result) {
          dispatch('getBalance', account);
          dispatch('getApprove', account);
          if (rootGetters['wait/is']('tx.' + result.transactionHash)) {
            dispatch('wait/end', 'tx.' + result.transactionHash, {
              root: true
            });
          }
        }
      });
    });
  },
  setTokens({ commit }, networkId) {
    const chain = config.chain(networkId);
    Object.keys(chain.TOKEN).forEach(name => {
      commit('setToken', { name, data: chain.TOKEN[name] });
    });
  },
  getBalance({ commit, state }, account) {
    Object.keys(state.tokens).forEach(async name => {
      commit('balance', {
        name,
        balance: await getBalanceToken(account, state.tokens[name].address)
      });
    });
  },
  getApprove({ commit, state }, account) {
    Object.keys(state.tokens).forEach(async name => {
      commit('approve', {
        name,
        approve: await getApproveToken(account, state.tokens[name].address)
      });
    });
  }
};

// mutations
const mutations = {
  run(state) {
    state.run = true;
  },
  setToken(state, { name, data }) {
    state.tokens[name] = {
      ...data,
      balance: 0,
      approve: 0
    };
  },
  balance(state, { name, balance }) {
    state.tokens[name].balance = balance;
  },
  approve(state, { name, approve }) {
    state.tokens[name].approve = approve;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
