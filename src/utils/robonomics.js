import Robonomics, { MessageProviderIpfs } from 'robonomics-js';
import config from '../config';

let robonomics = null;
export const initRobonomics = (ipfs, network) => {
  robonomics = new Robonomics({
    web3,
    account: {
      address: web3.eth.accounts[0]
    },
    ens: {
      address: config.chain(network).ROBONOMICS.ens,
      suffix: config.chain(network).ROBONOMICS.ensSuffix,
      version: config.ROBONOMICS.version
    },
    messageProvider: new MessageProviderIpfs(ipfs)
  });
  return robonomics;
};
const getRobonomics = () => {
  if (robonomics === null) {
    throw new Error('Robonomics not init');
  }
  return robonomics;
};

export default getRobonomics;
