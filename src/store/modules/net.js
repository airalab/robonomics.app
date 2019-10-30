import Web3 from 'web3';
import _has from 'lodash/has';
import dateFormat from 'dateformat';
import getIpfs from '../../RComponents/tools/ipfs';
import { recovery, getDataByIpns } from '../../utils/utils';
import config from '../../config';

const web3Static = new Web3('wss://mainnet.infura.io/ws');

// initial state
const state = {
  run: false,
  nodes: {}
};

// getters
const getters = {};

// actions
const actions = {
  init({ commit, dispatch, state }) {
    if (state.run) {
      return;
    }
    commit('run');
    const ipfs = getIpfs();

    config.NET_TOPICS.forEach(topic => {
      const suffix = topic.split('.');
      const network =
        suffix[suffix.length - 1] === 'eth' ? 'mainnet' : 'sidechain';
      ipfs.pubsub.subscribe(
        topic,
        r => {
          const hash = r.data
            .toString()
            .trim()
            .replace(new RegExp('"', 'g'), '');
          dispatch('add', { hash, network });
        },
        { discover: true }
      );
    });
  },
  add({ commit, dispatch, state }, { hash, network }) {
    if (!_has(state.nodes, hash)) {
      commit('add', { hash, network });
    }
    dispatch('update', hash);
  },
  async update({ commit, dispatch }, hash) {
    const ipnsContent = await getDataByIpns(hash);
    if (ipnsContent === false) {
      return;
    }

    const data = ipnsContent.split('---');

    let info;
    try {
      info = JSON.parse(data[0].trim());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return;
    }

    let address = '';
    if (_has(info, 'address')) {
      address = info.address.toLowerCase();
    } else if (data.length === 2) {
      address = recovery(data[0].trim(), data[1].trim()).toLowerCase();
    }

    commit('update', {
      hash,
      data: {
        ...info,
        address,
        date: dateFormat(new Date(info.timestamp * 1000), 'dd.mm.yyyy HH:MM:ss')
      }
    });

    dispatch('provider', {
      hash,
      lighthouse: info.lighthouse,
      address
    });
  },
  async provider({ commit }, { hash, lighthouse, address }) {
    const lighthouseAddr = await web3Static.eth.ens.getAddress(lighthouse);
    const abi = [
      {
        constant: true,
        inputs: [
          {
            name: '',
            type: 'address'
          }
        ],
        name: 'indexOf',
        outputs: [
          {
            name: '',
            type: 'uint256'
          }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
        signature: '0xfd6aad25'
      }
    ];
    const li = new web3Static.eth.Contract(abi, lighthouseAddr);
    let provider = 0
    try {
      provider = await li.methods.indexOf(address).call();
    } catch (error) {
      console.log(error.message);
    }

    commit('update', {
      hash,
      data: {
        provider: provider > 0 ? true : false
      }
    });
  }
};

// mutations
const mutations = {
  run(state) {
    state.run = true;
  },
  add(state, { hash, network }) {
    state.nodes = {
      ...state.nodes,
      [hash]: {
        id: hash,
        network
      }
    };
  },
  update(state, { hash, data }) {
    state.nodes = {
      ...state.nodes,
      [hash]: {
        ...state.nodes[hash],
        ...data
      }
    };
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
