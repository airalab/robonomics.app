import _sortBy from "lodash/sortBy";
import Promise from "bluebird";
import getRobonomics from "../../utils/robonomics";
// import { Liability } from "robonomics-js";

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
  minimalStake: 0,
  minBlock: 0
};

// getters
const getters = {
  members: state => {
    return _sortBy(state.members, "i");
  },
  downtime: state => {
    return state.currentBlock - state.keepAliveBlock;
  },
  isSleeping: (state, getters) => {
    return getters.downtime > state.timeoutInBlocks;
  }
};

// actions
const actions = {
  async init({ commit, dispatch }) {
    commit("run");
    commit("clear");
    robonomics = getRobonomics();
    robonomics.ready().then(() => {
      dispatch("fetchData");
      dispatch("watchBlock");
    });
  },
  fetchData({ commit, dispatch }) {
    robonomics.xrt.methods
      .balanceOf(robonomics.lighthouse.address)
      .call()
      .then(r => {
        commit("setLighthouseBalance", Number(r));
      });
    robonomics.lighthouse.methods
      .minimalStake()
      .call()
      .then(r => {
        commit("setMinimalStake", Number(r));
      });
    robonomics.lighthouse.methods
      .quota()
      .call()
      .then(r => {
        commit("setQuota", Number(r));
      });
    robonomics.lighthouse.methods
      .marker()
      .call()
      .then(r => {
        commit("setMarker", Number(r));
      });
    robonomics.lighthouse.methods
      .keepAliveBlock()
      .call()
      .then(r => {
        commit("setKeepAliveBlock", Number(r));
      });
    robonomics.lighthouse.methods
      .timeoutInBlocks()
      .call()
      .then(r => {
        commit("setTimeoutInBlocks", Number(r));
      });
    dispatch("getProviders");
  },
  getProviders({ state, commit, dispatch }) {
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
          last: null,
          lastTx: null
        });
        quotas.push(robonomics.lighthouse.methods.quotaOf(member).call());
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
              robonomics.web3.utils.fromWei(balance)
            ).toFixed(3);
          });
          members.forEach((item, i) => {
            const index = state.members.findIndex(member => {
              return member.address === item.address;
            });
            if (index >= 0) {
              members[i].last = state.members[index].last;
              members[i].lastTx = state.members[index].lastTx;
            }
          });

          commit("members", members);
          dispatch("providerLastBlock");
        });
    });
  },
  async providerLastBlock({ commit, state }) {
    const lastBlock = await robonomics.web3.eth.getBlockNumber();

    const fromBlock =
      state.lastUpdFind > 0
        ? state.lastUpdFind
        : state.keepAliveBlock > 0
        ? state.keepAliveBlock - state.timeoutInBlocks
        : lastBlock - 100;

    if (fromBlock === lastBlock) {
      // skip
      return;
    }

    // const li = new Liability(
    //   robonomics.web3,
    //   "0xd65Ef32bB136421d8243210292ce2aFE5c0e6b81"
    // );
    // const events = await li.getPastEvents("Finalized", {
    //   fromBlock: fromBlock,
    //   toBlock: lastBlock
    // });
    // console.log(events);

    const events = (
      await robonomics.factory.getPastEvents("NewLiability", {
        fromBlock: fromBlock,
        toBlock: lastBlock
      })
    ).reverse();

    const newMembers = {};
    for (let item of events) {
      const t = await robonomics.web3.eth.getTransaction(item.transactionHash);
      if (t.to === robonomics.lighthouse.address) {
        const index = state.members.findIndex(member => {
          return member.address === t.from;
        });
        if (index >= 0) {
          newMembers[index] = {
            block: item.blockNumber,
            tx: item.transactionHash
          };
          break;
        }
      }
    }
    Object.keys(newMembers).forEach(index => {
      commit("setLastBlockProvider", {
        ...newMembers[index],
        index
      });
    });
    if (state.minBlock === 0) {
      commit("setMinBlock", fromBlock);
    }
    commit("setLastUpdFind", lastBlock);
  },
  watchBlock({ commit, state, dispatch }) {
    const setCurrentBlock = () => {
      robonomics.web3.eth.getBlockNumber((e, r) => {
        commit("setCurrentBlock", r);
        setTimeout(setCurrentBlock, 5000);
      });
    };
    setCurrentBlock();
    const updData = () => {
      if (state.currentBlock - state.lastUpd >= 1) {
        dispatch("fetchData");
        commit("setLastUpd", state.currentBlock);
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
  setLastBlockProvider(state, data) {
    state.members[data.index].last = data.block;
    state.members[data.index].lastTx = data.tx;
  },
  setMinBlock(state, data) {
    state.minBlock = data;
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
