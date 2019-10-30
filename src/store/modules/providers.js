import _find from 'lodash/find';
import _sortBy from 'lodash/sortBy';
import _values from 'lodash/values';
import _mapValues from 'lodash/mapValues';
import Promise from 'bluebird';
import getRobonomics from '../../RComponents/tools/robonomics';
import { findLastTx } from '../../utils/utils';

let robonomics;

// initial state
const state = {
  run: false,
  members: [],
  marker: 0,
  quota: 0,
  keepAliveBlock: 0,
  currentBlock: 0,
  timeoutInBlocks: 0,
  lastUpd: 0,
  lastUpdFind: 0,
  lighthouseBalance: 0,
  minimalStake: 0
};

// getters
const getters = {
  members: state => {
    return _sortBy(state.members, 'i');
  }
};

// actions
const actions = {
  async init({ commit, dispatch }) {
    commit('run');
    commit('clear');
    robonomics = getRobonomics();
    robonomics.ready().then(() => {
      dispatch('fetchData');
      dispatch('watchBlock');
    });
  },
  fetchData({ commit, dispatch }) {
    robonomics.xrt.call.balanceOf(robonomics.lighthouse.address).then(r => {
      commit('setLighthouseBalance', Number(r));
    });
    robonomics.lighthouse.call.minimalStake().then(r => {
      commit('setMinimalStake', Number(r));
    });
    robonomics.lighthouse.call.quota().then(r => {
      commit('setQuota', Number(r));
    });
    robonomics.lighthouse.call.marker().then(r => {
      commit('setMarker', Number(r));
    });
    robonomics.lighthouse.call.keepAliveBlock().then(r => {
      commit('setKeepAliveBlock', Number(r));
    });
    robonomics.lighthouse.call.timeoutInBlocks().then(r => {
      commit('setTimeoutInBlocks', Number(r));
    });
    dispatch('getProviders');
  },
  getProviders({ commit, dispatch }) {
    robonomics.lighthouse.getProviders().then(result => {
      const members = [];
      const quotas = [];
      const balances = [];
      result.forEach((member, i) => {
        members.push({
          i: i + 1,
          address: member,
          quota: 0,
          balance: 0,
          last: null
        });
        quotas.push(robonomics.lighthouse.call.quotaOf(member));
        balances.push(
          Promise.promisify(robonomics.web3.eth.getBalance)(member)
        );
      });
      Promise.all(quotas)
        .then(res => {
          res.forEach((quota, i) => {
            members[i].quota = Number(quota);
          });
          return Promise.all(balances);
        })
        .then(res => {
          res.forEach((balance, i) => {
            members[i].balance = Number(
              robonomics.web3.fromWei(balance)
            ).toFixed(3);
          });
          members.forEach((item, i) => {
            const last = _find(this.members, { address: item.address });
            if (last) {
              members[i].last = last.last;
            }
          });

          commit('members', members);
          dispatch('providerLastBlock');
        });
    });
  },
  providerLastBlock({ commit, state }) {
    robonomics.web3.eth.getBlockNumber((e, lastBlock) => {
      findLastTx(
        _values(_mapValues(state.members, 'address')),
        robonomics.lighthouse.address,
        lastBlock,
        state.lastUpdFind === 0
          ? lastBlock - state.timeoutInBlocks
          : state.lastUpdFind
      ).then(r => {
        const newMembers = [];
        for (let i = 0; i < state.members.length; i++) {
          newMembers.push({
            ...state.members[i],
            last:
              state.members[i].last === null ||
              r[state.members[i].address] > state.members[i].last
                ? r[state.members[i].address]
                : state.members[i].last
          });
        }
        commit('members', newMembers);
        commit('setLastUpdFind', lastBlock);
      });
    });
  },
  watchBlock({ commit, state, dispatch }) {
    const setCurrentBlock = () => {
      robonomics.web3.eth.getBlockNumber((e, r) => {
        commit('setCurrentBlock', r);
        setTimeout(setCurrentBlock, 5000);
      });
    };
    setCurrentBlock();
    const updData = () => {
      if (state.currentBlock - state.lastUpd >= 1) {
        dispatch('fetchData');
        commit('setLastUpd', state.currentBlock);
      }
      setTimeout(updData, 5000);
    };
    updData();
  }
};

// mutations
const mutations = {
  run(state) {
    state.run = true;
  },
  clear(state) {
    state.run = false;
    state.members = [];
    state.marker = 0;
    state.quota = 0;
    state.keepAliveBlock = 0;
    state.currentBlock = 0;
    state.timeoutInBlocks = 0;
    state.lastUpd = 0;
    state.lastUpdFind = 0;
    state.lighthouseBalance = 0;
    state.minimalStake = 0;
  },
  setQuota(state, data) {
    state.quota = data;
  },
  setMarker(state, data) {
    state.marker = data;
  },
  setKeepAliveBlock(state, data) {
    state.keepAliveBlock = data;
  },
  setTimeoutInBlocks(state, data) {
    state.timeoutInBlocks = data;
  },
  members(state, data) {
    state.members = data;
  },
  setLastUpdFind(state, data) {
    state.lastUpdFind = data;
  },
  setLastUpd(state, data) {
    state.lastUpd = data;
  },
  setCurrentBlock(state, data) {
    state.currentBlock = data;
  },
  setLighthouseBalance(state, data) {
    state.lighthouseBalance = data;
  },
  setMinimalStake(state, data) {
    state.minimalStake = data;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
