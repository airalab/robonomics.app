import * as utils from './utils';

export const fromWei = (amount, decimals, currency = '') => {
  return `${utils.fromWei(amount, decimals)}${currency ? ' ' : ''}${currency}`;
};

export const urlExplorer = (address, type = 'address', chainid = 1) => {
  // const chainid = Web3Check.store.state.networkId;
  let domain = 'etherscan.io';
  if (type === '') {
    type = 'address';
  }
  if (chainid === 4451) {
    domain = 'explorer.aira.life';
    if (type === 'address') {
      type = 'addr';
    }
  } else {
    let chain = '';
    if (chainid === 4) {
      chain = 'rinkeby.';
    }
    domain = chain + domain;
  }
  return `https://${domain}/${type}/${address}`;
};

export const urlIpfs = (hash, type = 'ipfs') => {
  const domain = 'ipfs.io';
  if (type === '') {
    type = 'ipfs';
  }
  return `https://${domain}/${type}/${hash}`;
};
