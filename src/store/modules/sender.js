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
  statuses: STATUS
};

// getters
const getters = {
  demandById: state => id => {
    return state.demands[id] ? state.demands[id] : null;
  }
};

// actions
const actions = {
  sendDemand({ state, commit, getters }, demand) {
    const robonomics = getRobonomics();
    const id = Object.keys(state.demands).length + 1;
    commit('msg', { id, type: 'demands', msg: demand });
    commit('status', { id, type: 'demands', status: STATUS.BTN });

    robonomics
      .sendDemand(demand, true, msg => {
        if (timeout > 0) {
          commit('status', { id, type: 'demands', status: STATUS.BROADCAST });
          const intervalSend = setInterval(() => {
            robonomics.messenger.channel.send(msg.encode());
          }, timeout);
          commit('broadcast', { id, type: 'demands', broadcast: intervalSend });
          const intervalWatch = robonomics.onOffer(demand.model, msg => {
            if (
              msg.model.toLowerCase() == demand.model.toLowerCase() &&
              msg.objective.toLowerCase() == demand.objective.toLowerCase() &&
              msg.token.toLowerCase() == demand.token.toLowerCase() &&
              msg.cost == demand.cost
            ) {
              console.log('stop');
              commit('status', { id, type: 'demands', status: STATUS.OFFER });
              clearInterval(intervalSend);
              clearInterval(intervalWatch);
            }
          });
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
