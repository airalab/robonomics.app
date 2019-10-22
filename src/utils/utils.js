import crypto from 'crypto';
import axios from 'axios';
import { web3Utils, utils } from 'robonomics-js';
import getIpfs from './ipfs';

export const toWei = (price, decimals) => {
  const priceNum = new web3.BigNumber(price);
  return priceNum.shift(decimals).toNumber();
};
export const fromWei = (price, decimals) => {
  const priceNum = new web3.BigNumber(price);
  return priceNum.shift(-decimals).toNumber();
};
export const genObjective = data => {
  let hash;
  return getIpfs()
    .then(ipfs => {
      return ipfs.add(Buffer.from(''+data));
    })
    .then(r => {
      hash = r[0].hash;
      return axios.get(`https://ipfs.robonomics.network/ipfs/${hash}`);
    })
    .then(() => {
      return hash;
    })
    .catch(e => {
      console.log(e);
    });
};
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}
export const randomObjective = () => {
  const data = getRandomInt(0, 100000).toString()
  const hashFunction = Buffer.from('12', 'hex')
  const digest = crypto.createHash('sha256').update(data).digest()
  const digestSize = Buffer.from(digest.byteLength.toString(16), 'hex')
  const combined = Buffer.concat([hashFunction, digestSize, digest])
  const multihash = utils.base58.encode(combined)
  return multihash.toString()
};
export const watchTx = tx => {
  const transactionReceiptAsync = (resolve, reject) => {
    web3.eth.getTransactionReceipt(tx, (error, receipt) => {
      if (error) {
        reject(error);
      } else if (receipt === null) {
        setTimeout(() => transactionReceiptAsync(resolve, reject), 5000);
      } else {
        resolve(receipt);
      }
    });
  };
  if (Array.isArray(tx)) {
    return Promise.all(tx.map(oneTx => watchTx(oneTx)));
  } else if (typeof tx === 'string') {
    return new Promise(transactionReceiptAsync);
  }
  throw new Error(`Invalid Type: ${tx}`);
};

export const promisify = fn => {
  return (args = []) =>
    new Promise((resolve, reject) => {
      fn(...args, (e, r) => {
        if (e) {
          return reject(e);
        }
        resolve(r);
      });
    });
};

export const intFormat = x => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const floatFormat = x => {
  var parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join('.');
};

export const recovery = (data, signature) => {
  const message = web3Utils.utils.isHexStrict(data)
    ? web3Utils.utils.hexToBytes(data)
    : data;
  const messageBuffer = Buffer.from(message);
  const preamble = '\x19Ethereum Signed Message:\n' + message.length;
  const preambleBuffer = Buffer.from(preamble);
  const ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);
  const hash = web3Utils.hash.keccak256s(ethMessage);
  return web3Utils.account.recover(hash, signature);
};

const scan = (block, accounts, lighthouse) => {
  return new Promise(resolve => {
    const res = { ...accounts };
    web3.eth.getBlock(block, true, (e, r) => {
      if (e) {
        return resolve(res);
      }
      if (r === null || r.transactions === null) {
        return resolve(res);
      }
      r.transactions.forEach(item => {
        const from = web3.toChecksumAddress(item.from);
        if (Object.prototype.hasOwnProperty.call(accounts, from) && accounts[from] === null) {
          if (web3.toChecksumAddress(item.to) === lighthouse) {
            res[from] = item.blockNumber;
          }
        }
      });
      return resolve(res);
    });
  });
};

const isStop = result => {
  for (const account in result) {
    if (result[account] === null) {
      return false;
    }
  }
  return true;
};

export async function findLastTx(accounts, lighthouse, to, from) {
  let result = {};
  for (let i = 0; i < accounts.length; i++) {
    result[accounts[i]] = null;
  }
  for (let i = to; i > from; i--) {
    result = await scan(i, result, lighthouse);
    if (isStop(result)) {
      return result;
    }
  }
  return result;
}
