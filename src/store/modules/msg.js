import getRobonomics from "../../utils/robonomics";

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
  listen({ getters, commit }, { id, hasOffer = false }) {
    const robonomics = getRobonomics();
    const demandModel = getters.demandById(id);
    if (hasOffer === false) {
      const offerListener = robonomics.onOffer(demandModel.model, msg => {
        const demand = getters.demandById(id);
        console.log("offer", msg);
        if (
          msg.objective === demand.objective &&
          msg.token === demand.token &&
          msg.cost === demand.cost
        ) {
          commit("status", { id, status: STATUS.OFFER });
          commit("offer", { id, offer: msg });
          robonomics.messenger.off(offerListener);
          clearInterval(demand.broadcast);
        }
      });
    }
    const resultListener = robonomics.onResult(msg => {
      const demand = getters.demandById(id);
      console.log("result unverified", msg);
      console.log(demand.liability, demand);
      console.log(
        demand.liability !== null && msg.liability === demand.liability
      );
      if (demand.liability !== null && msg.liability === demand.liability) {
        commit("result", { id, result: msg });
        commit("status", { id, status: STATUS.REPORT });
        robonomics.messenger.off(resultListener);
      }
    });
  },
  send(
    { state, commit, dispatch, getters },
    { demand, hasOffer = false, timeout = 5000 }
  ) {
    const robonomics = getRobonomics();
    const id = Object.keys(state.demands).length + 1;
    commit("msg", { id, demand });
    commit("status", { id, status: STATUS.BTN });

    robonomics
      .sendDemand(demand, true, msg => {
        dispatch("listen", { id, hasOffer });
        // console.log(msg.getHash());
        if (timeout > 0) {
          commit("status", { id, status: STATUS.BROADCAST });
          const interval = setInterval(() => {
            robonomics.messenger.channel.send(msg.encode());
          }, timeout);
          commit("broadcast", { id, broadcast: interval });
        } else {
          commit("status", { id, status: STATUS.SEND });
        }
      })
      .then(liability => {
        console.log("liability demand", liability.address);
        commit("liability", { id, liability: liability.address });
        commit("status", { id, status: STATUS.CONTRACT });
        const interval = setInterval(() => {
          liability.result().then(r => {
            if (r) {
              clearInterval(interval);
              commit("result", { id, result: { result: r } });
              commit("status", { id, status: STATUS.RESULT });
            }
          });
        }, 1000);
        commit("fallback", { id, fallback: interval });
        return liability.onResult();
      })
      .then(result => {
        const demand = getters.demandById(id);
        clearInterval(demand.fallback);
        console.log("result", result);
        commit("result", { id, result: { result } });
        commit("status", { id, status: STATUS.RESULT });
      })
      .catch(e => {
        console.log(e);
        commit("status", { id, status: STATUS.EMPTY });
      });

    return id;
  }
};

// mutations
const mutations = {
  msg(state, { id, demand }) {
    state.demands = {
      ...state.demands,
      [id]: {
        ...demand,
        status: STATUS.EMPTY,
        liability: null,
        offer: null,
        result: null,
        broadcast: null,
        fallback: null
      }
    };
  },
  status(state, { id, status }) {
    state.demands[id] = { ...state.demands[id], status };
  },
  broadcast(state, { id, broadcast }) {
    state.demands[id] = { ...state.demands[id], broadcast };
  },
  liability(state, { id, liability }) {
    state.demands[id] = { ...state.demands[id], liability };
  },
  offer(state, { id, offer }) {
    state.demands[id] = { ...state.demands[id], offer };
  },
  result(state, { id, result }) {
    state.demands[id] = { ...state.demands[id], result };
  },
  fallback(state, { id, fallback }) {
    state.demands[id] = { ...state.demands[id], fallback };
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
