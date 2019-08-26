import Vue from 'vue';
import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';
import getRobonomics from '../../utils/robonomics';
import getIpfs from '../../utils/ipfs';

let robonomics;

// initial state
const state = {
  run: false,
  model: null,
  offers: [],
  demands: [],
  lis: []
};

// getters
const getters = {
  offers: state => {
    return state.offers.slice(0, 20);
  },
  demands: state => {
    return state.demands.slice(0, 20);
  }
};

// actions
const actions = {
  async init({ commit, dispatch }) {
    commit('run');
    commit('clear');
    robonomics = getRobonomics();
    robonomics.ready().then(() => {
      getIpfs().then(ipfs => {
        ipfs.id((err, info) => {
          commit('model', info.id);
          dispatch('onOffer');
          dispatch('onDemand');
          dispatch('onLiability');
        });
      });

    });
  },
  onOffer({ commit, state }) {
    robonomics.onOffer(state.model, msg => {
      console.log('offer', msg);
      const item = _find(state.offers, { signature: msg.signature });
      if (!item) {
        commit('addOffer', msg);
      }
    });
  },
  onDemand({ commit, state }) {
    robonomics.onDemand(state.model, msg => {
      console.log('demand', msg);
      const item = _find(state.demands, { signature: msg.signature });
      if (!item) {
        commit('addDemand', msg);
      }
    });
  },
  onLiability({ commit, state, dispatch }) {
    robonomics.onLiability((err, liability) => {
      liability.getInfo().then(info => {
        const item = _find(state.lis, { address: liability.address });
        if (!item) {
          commit('addLiability', {
            address: liability.address,
            worker: liability.worker,
            ...info
          });
          commit('stopWatchDemand', info.demandHash);
          commit('stopWatchOffer', info.offerHash);
          dispatch('onResult', liability);
        }
      });
    });
  },
  onResult({ commit }, liability) {
    liability.onResult().then(result => {
      commit('setLiabilityResult', { address: liability.address, result });
    });
  }
};

// mutations
const mutations = {
  run(state) {
    state.run = true;
  },
  model(state, model) {
    state.model = model;
  },
  clear(state) {
    state.offers = [];
    state.demands = [];
    state.lis = [];
  },
  addOffer(state, msg) {
    state.offers.unshift({ ...msg, hash: msg.getHash(), watch: true });
  },
  addDemand(state, msg) {
    state.demands.unshift({ ...msg, hash: msg.getHash(), watch: true });
  },
  addLiability(state, msg) {
    state.lis.unshift({ ...msg });
  },
  setLiabilityResult(state, data) {
    const i = _findIndex(state.lis, { address: data.address });
    if (i >= 0) {
      Vue.set(state.lis, i, { ...state.lis[i], result: data.result });
    }
  },
  stopWatchDemand(state, hash) {
    const demandIndex = _findIndex(state.demands, {
      hash
    });
    if (demandIndex >= 0) {
      state.demands[demandIndex] = {
        ...state.demands[demandIndex],
        watch: false
      };
    }
  },
  stopWatchOffer(state, hash) {
    const offerIndex = _findIndex(state.offers, {
      hash
    });
    if (offerIndex >= 0) {
      state.offers[offerIndex] = {
        ...state.offers[offerIndex],
        watch: false
      };
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
