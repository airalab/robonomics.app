import Robonomics from 'robonomics-js';
import has from 'lodash/has';
import Provider from './provider';

const socket = io('https://wss.pool.aira.life');
const robonomics = new Robonomics({
  web3,
  provider: new Provider(socket),
});

const chanel = {};
export const getChanel = (lighthouse) => {
  if (!has(chanel, lighthouse)) {
    chanel[lighthouse] = robonomics.chanel(`${lighthouse}`);
  }
  return chanel[lighthouse];
};

export default robonomics;
