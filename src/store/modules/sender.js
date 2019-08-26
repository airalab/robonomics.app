import getRobonomics from '../../utils/robonomics';

const STATUS = {
  EMPTY: 0,
  BTN: 1,
  BROADCAST: 2,
  SEND: 3,
  OFFER: 4,
  TX: 5,
  CONTRACT: 6,
  REPORT: 7,
  RESULT: 8
};
const timeout = 5000;

// initial state
const state = {
  demands: {},
  offers: {},
  statuses: STATUS
};

// getters
const getters = {
  demandById: state => id => {
    return state.demands[id] ? state.demands[id] : null;
  },
  offerById: state => id => {
    return state.offers[id] ? state.offers[id] : null;
  },
  getLastObjectiveDemand: state => {
    let objective = null
    Object.keys(state.demands).every((id) => {
      if (state.demands[id].status < STATUS.OFFER) {
        objective = state.demands[id].objective
        return false
      }
    })
    return objective
  },
  getLastObjectiveOffer: state => {
    let objective = null
    Object.keys(state.offers).every((id) => {
      if (state.offers[id].status < STATUS.OFFER) {
        objective = state.offers[id].objective
        return false
      }
    })
    return objective
  }
};

// actions
const actions = {
  checkDemand({ commit, dispatch }, msg) {
    Object.keys(state.demands).forEach((id) => {
      const demand = state.demands[id];
      if (
        demand.status < STATUS.OFFER &&
        msg.model === demand.model &&
        msg.objective === demand.objective &&
        msg.token === demand.token &&
        msg.cost === demand.cost
      ) {
        console.log('checkDemand', demand);
        commit('status', { id, type: 'demands', status: STATUS.OFFER });
        clearInterval(demand.broadcast);
        dispatch('checkOffer', msg);
      }
    })
  },
  checkOffer({ commit, dispatch }, msg) {
    Object.keys(state.offers).forEach((id) => {
      const offer = state.offers[id];
      if (
        offer.status < STATUS.OFFER &&
        msg.model === offer.model &&
        msg.objective === offer.objective &&
        msg.token === offer.token &&
        msg.cost === offer.cost
      ) {
        console.log('checkOffer', offer);
        commit('status', { id, type: 'offers', status: STATUS.OFFER });
        clearInterval(offer.broadcast);
        dispatch('checkDemand', msg);
      }
    })
  },
  sendDemand({ state, commit, dispatch, getters }, demand) {
    const robonomics = getRobonomics();
    const id = Object.keys(state.demands).length + 1;
    commit('msg', { id, type: 'demands', msg: demand });
    commit('status', { id, type: 'demands', status: STATUS.BTN });

    robonomics
      .sendDemand(demand, true, msg => {
        // console.log(msg.getHash());
        if (timeout > 0) {
          commit('status', { id, type: 'demands', status: STATUS.BROADCAST });
          const interval = setInterval(() => {
            robonomics.messenger.channel.send(msg.encode());
          }, timeout);
          commit('broadcast', { id, type: 'demands', broadcast: interval });
          dispatch('checkOffer', msg);
        } else {
          commit('status', { id, type: 'demands', status: STATUS.SEND });
        }
      })
      .then(liability => {
        console.log('liability demand', liability.address);
        const demand = getters.demandById(id);
        clearInterval(demand.broadcast);
        commit('liability', { id, type: 'demands', liability: liability.address });
        commit('status', { id, type: 'demands', status: STATUS.CONTRACT });
        const interval = setInterval(() => {
          liability.contract.result((e, r) => {
            if (e) {
              clearInterval(interval);
              return;
            }
            if (r && r !== '0x') {
              clearInterval(interval);
              console.log('result fallback');
              // console.log("r", hexToStr(r));
              commit('status', { id, type: 'demands', status: STATUS.RESULT });
            }
          });
        }, 1000);
        commit('fallback', { id, type: 'demands', fallback: interval });
        return liability.onResult();
      })
      .then(result => {
        const demand = getters.demandById(id);
        clearInterval(demand.fallback);
        console.log('result', result);
        commit('status', { id, type: 'demands', status: STATUS.RESULT });
      })
      .catch(e => {
        console.log(e);
        commit('status', { id, type: 'demands', status: STATUS.EMPTY });
      });

    return id;
  },
  sendOffer({ state, commit, dispatch, getters }, offer) {
    const robonomics = getRobonomics();
    const id = Object.keys(state.offers).length + 1;
    commit('msg', { id, type: 'offers', msg: offer });
    commit('status', { id, type: 'offers', status: STATUS.BTN });

    robonomics
      .sendOffer(offer, true, msg => {
        // console.log(msg.getHash());
        if (timeout > 0) {
          commit('status', { id, type: 'offers', status: STATUS.BROADCAST });
          const interval = setInterval(() => {
            robonomics.messenger.channel.send(msg.encode());
          }, timeout);
          commit('broadcast', { id, type: 'offers', broadcast: interval });
          dispatch('checkDemand', msg);
        } else {
          commit('status', { id, type: 'offers', status: STATUS.SEND });
        }
      })
      .then(liability => {
        console.log('liability offer', liability.address);
        const offer = getters.offerById(id);
        clearInterval(offer.broadcast);
        commit('liability', { id, type: 'offers', liability: liability.address });
        commit('status', { id, type: 'offers', status: STATUS.CONTRACT });
        const interval = setInterval(() => {
          liability.contract.result((e, r) => {
            if (e) {
              clearInterval(interval);
              return;
            }
            if (r && r !== '0x') {
              clearInterval(interval);
              console.log('result fallback');
              // console.log("r", hexToStr(r));
              commit('status', { id, type: 'offers', status: STATUS.RESULT });
            }
          });
        }, 1000);
        commit('fallback', { id, type: 'offers', fallback: interval });
        return liability.onResult();
      })
      .then(result => {
        const offer = getters.offerById(id);
        clearInterval(offer.fallback);
        console.log('result', result);
        commit('status', { id, type: 'offers', status: STATUS.RESULT });
      })
      .catch(e => {
        console.log(e);
        commit('status', { id, type: 'offers', status: STATUS.EMPTY });
      });

    return id;
  }
};

// mutations
const mutations = {
  msg(state, { id, type, msg }) {
    state[type] = {
      ...state[type],
      [id]: {
        ...msg,
        status: STATUS.EMPTY,
        liability: null,
        result: null,
        broadcast: null,
        fallback: null
      }
    };
  },
  status(state, { id, type, status }) {
    state[type][id] = { ...state[type][id], status };
  },
  broadcast(state, { id, type, broadcast }) {
    state[type][id] = { ...state[type][id], broadcast };
  },
  liability(state, { id, type, liability }) {
    state[type][id] = { ...state[type][id], liability };
  },
  result(state, { id, type, result }) {
    state[type][id] = { ...state[type][id], result };
  },
  fallback(state, { id, type, fallback }) {
    state[type][id] = { ...state[type][id], fallback };
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
