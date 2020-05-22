import axios from "axios";
import { floatFormat, intFormat } from "../../utils/utils";
import config from "~config";

// initial state
const state = {
  run: false,
  connected: false,
  lastBlock: 0,
  totalSupply: 0,
  wn: 0,
  gas: {
    full: {
      a: 0,
      d: 0,
      w: 0,
      m: 0
    },
    fin: {
      a: 0,
      d: 0,
      w: 0,
      m: 0
    }
  },
  li: {
    create: {
      a: 0,
      d: 0,
      w: 0,
      m: 0
    },
    fin: {
      a: 0,
      d: 0,
      w: 0,
      m: 0
    }
  },
  contracts: []
};

// getters
const getters = {};

// actions
const actions = {
  async init({ commit, state }) {
    if (state.run) {
      return;
    }
    commit("run");
    const api = config.chain.get().STATISTICS_API;
    axios.get(api + "/start").then((r) => {
      commit("connected", r.data.result.connected);
      commit("lastBlock", r.data.result.lastBlock);
      commit("totalSupply", r.data.result.totalSupply);
      commit("wn", r.data.result.wn);
      commit("gas", r.data.result.gas);
      commit("li", r.data.result.li);
      commit("contracts", r.data.result.liability);
    });

    const socket = io(api);
    socket.on("lastBlock", (r) => {
      commit("lastBlock", r);
    });
    socket.on("data", (r) => {
      commit("connected", r.connected);
      commit("totalSupply", r.totalSupply);
      commit("wn", r.wn);
      commit("gas", r.gas);
      commit("li", r.li);
      commit("contracts", r.liability);
    });
  }
};

// mutations
const mutations = {
  run(state) {
    state.run = true;
  },
  connected(state, data) {
    state.connected = data;
  },
  lastBlock(state, data) {
    state.lastBlock = data;
  },
  totalSupply(state, data) {
    state.totalSupply = floatFormat(data);
  },
  wn(state, data) {
    state.wn = data;
  },
  gas(state, data) {
    Object.keys(data.full).forEach((key) => {
      state.gas.full[key] = intFormat(Math.round(data.full[key]));
      state.gas.fin[key] = intFormat(Math.round(data.fin[key]));
    });
  },
  li(state, data) {
    Object.keys(data.create).forEach((key) => {
      state.li.create[key] = intFormat(Math.round(data.create[key]));
      state.li.fin[key] = intFormat(Math.round(data.fin[key]));
    });
  },
  contracts(state, data) {
    state.contracts = data;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
