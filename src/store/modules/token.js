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
  air: {
    address: config.AMBIX.AIR,
    label: 'AIRA',
    decimals: config.AMBIX.AIR_DECIMALS,
    balance: 0,
    approve: 0
  },
  airkyc: {
    address: config.AMBIX.AIR_KYC,
    label: 'AIRA ID',
    decimals: config.AMBIX.AIR_KYC_DECIMALS,
    balance: 0,
    approve: 0
  },
  xrt: {
    address: config.AMBIX.XRT,
    label: 'XRT',
    decimals: config.AMBIX.XRT_DECIMALS,
    balance: 0,
    approve: 0
  }
};

// getters
const getters = {};

// actions
const actions = {
  async init({ commit, state, dispatch, rootGetters }, account) {
    if (state.run) {
      return;
    }
    commit('run');
    const contract = web3.eth.contract(ABI_TOKEN);
    const token1 = contract.at(config.AMBIX.AIR);
    const events1 = token1.allEvents({});
    events1.watch((error, result) => {
      if (result) {
        dispatch('getBalance', account);
        if (rootGetters['wait/is']('tx.' + result.transactionHash)) {
          dispatch('wait/end', 'tx.' + result.transactionHash, { root: true });
        }
      }
    });

    const token2 = contract.at(config.AMBIX.AIR_KYC);
    const events2 = token2.allEvents({});
    events2.watch((error, result) => {
      if (result) {
        dispatch('getBalance', account);
        if (rootGetters['wait/is']('tx.' + result.transactionHash)) {
          dispatch('wait/end', 'tx.' + result.transactionHash, { root: true });
        }
      }
    });

    const token3 = contract.at(config.AMBIX.XRT);
    const events3 = token3.allEvents({});
    events3.watch((error, result) => {
      if (result) {
        dispatch('getBalance', account);
        if (rootGetters['wait/is']('tx.' + result.transactionHash)) {
          dispatch('wait/end', 'tx.' + result.transactionHash, { root: true });
        }
      }
    });
  },
  async getBalance({ commit, dispatch }, account) {
    commit('air', await getBalanceToken(account, config.AMBIX.AIR));
    commit('airkyc', await getBalanceToken(account, config.AMBIX.AIR_KYC));
    commit('xrt', await getBalanceToken(account, config.AMBIX.XRT));
    dispatch('getApprove', account);
  },
  async getApprove({ commit }, account) {
    commit(
      'approveAir',
      await getApproveToken(account, config.AMBIX.AMBIX1, config.AMBIX.AIR)
    );
    commit(
      'approveAirkyc',
      await getApproveToken(account, config.AMBIX.AMBIX2, config.AMBIX.AIR_KYC)
    );
  }
};

// mutations
const mutations = {
  run(state) {
    state.run = true;
  },
  air(state, data) {
    state.air.balance = data;
  },
  airkyc(state, data) {
    state.airkyc.balance = data;
  },
  xrt(state, data) {
    state.xrt.balance = data;
  },
  approveAir(state, data) {
    state.air.approve = data;
  },
  approveAirkyc(state, data) {
    state.airkyc.approve = data;
  },
  approveXrt(state, data) {
    state.xrt.approve = data;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
