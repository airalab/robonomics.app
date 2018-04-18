import Aira from 'aira-js';
import has from 'lodash/has';
import Provider from './provider';

// const socket = io('https://devjs-01.corp.aira.life:3007');
// const socket = io('http://pool.aira.life:9999');
// const socket = io('http://localhost:9999');
const socket = io('https://wss.pool.aira.life');
const aira = new Aira({
  web3,
  provider: new Provider(socket),
});

const chanel = {};
export const getChanel = (lighthouse) => {
  if (!has(chanel, lighthouse)) {
    chanel[lighthouse] = aira.chanel(`${lighthouse}`);
  }
  return chanel[lighthouse];
};

export default aira;
