import axios from "axios";
import getRobonomics from "../RComponents/tools/robonomics";
// import crypto from "crypto";
// import { utils } from "robonomics-js";
// import getIpfs from "../RComponents/tools/ipfs";

// export const genObjective = data => {
//   // -
//   let hash;
//   const ipfs = getIpfs();
//   ipfs
//     .add(Buffer.from("" + data))
//     .then(r => {
//       hash = r[0].hash;
//       return axios.get(`https://ipfs.robonomics.network/ipfs/${hash}`);
//     })
//     .then(() => {
//       return hash;
//     })
//     .catch(e => {
//       console.log(e);
//     });
// };
// function getRandomInt(min, max) {
//   // -
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
// }
// export const randomObjective = () => {
//   // -
//   const data = getRandomInt(0, 100000).toString();
//   const hashFunction = Buffer.from("12", "hex");
//   const digest = crypto
//     .createHash("sha256")
//     .update(data)
//     .digest();
//   const digestSize = Buffer.from(digest.byteLength.toString(16), "hex");
//   const combined = Buffer.concat([hashFunction, digestSize, digest]);
//   const multihash = utils.base58.encode(combined);
//   return multihash.toString();
// };
// export const watchTx = tx => {
//   // -
//   const transactionReceiptAsync = (resolve, reject) => {
//     web3.eth.getTransactionReceipt(tx, (error, receipt) => {
//       if (error) {
//         reject(error);
//       } else if (receipt === null) {
//         setTimeout(() => transactionReceiptAsync(resolve, reject), 5000);
//       } else {
//         resolve(receipt);
//       }
//     });
//   };
//   if (Array.isArray(tx)) {
//     return Promise.all(tx.map(oneTx => watchTx(oneTx)));
//   } else if (typeof tx === "string") {
//     return new Promise(transactionReceiptAsync);
//   }
//   throw new Error(`Invalid Type: ${tx}`);
// };

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
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const floatFormat = x => {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(".");
};

export const recovery = (data, signature) => {
  const robonomics = getRobonomics();
  const message = robonomics.web3.utils.isHexStrict(data)
    ? robonomics.web3.utils.hexToBytes(data)
    : data;
  const messageBuffer = Buffer.from(message);
  const preamble = "\x19Ethereum Signed Message:\n" + message.length;
  const preambleBuffer = Buffer.from(preamble);
  const ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);
  const hash = robonomics.web3.utils.sha3._Hash.keccak256s(ethMessage);
  return robonomics.web3.eth.accounts.recover(hash, signature, true);
  // import account from "eth-lib/lib/account";
  // return account.recover(hash, signature);
};

const scan = (block, accounts, lighthouse) => {
  const robonomics = getRobonomics();
  return new Promise(resolve => {
    const res = { ...accounts };
    robonomics.web3.eth.getBlock(block, true, (e, r) => {
      if (e) {
        return resolve(res);
      }
      if (r === null || r.transactions === null) {
        return resolve(res);
      }
      r.transactions.forEach(item => {
        const from = robonomics.web3.utils.toChecksumAddress(item.from);
        if (
          Object.prototype.hasOwnProperty.call(accounts, from) &&
          accounts[from] === null
        ) {
          if (robonomics.web3.utils.toChecksumAddress(item.to) === lighthouse) {
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

const requestsIpns = new Set();
export const getDataByIpns = (hash, force = true) => {
  if (requestsIpns.has(hash) || force === false) {
    return Promise.resolve(false);
  }
  requestsIpns.add(hash);
  return axios
    .get(`https://ipfs.io/ipns/${hash}`)
    .then(r => {
      requestsIpns.delete(hash);
      return r.data;
    })
    .catch(() => {
      requestsIpns.delete(hash);
      return false;
    });
};
