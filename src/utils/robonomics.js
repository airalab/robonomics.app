import Robonomics, { MessageProviderIpfs } from 'robonomics-js';
import config, { VERSION } from '../config';

let robonomics = null;
export const initRobonomics = (ipfs, network) => {
  robonomics = new Robonomics({
    web3,
    account: {
      address: web3.eth.accounts[0]
    },
    ens: {
      address: config.ROBONOMICS.chains[Number(network)].ens,
      suffix: config.ROBONOMICS.chains[Number(network)].ensSuffix,
      version: VERSION
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
