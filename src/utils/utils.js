import axios from "axios";
import { tools } from "../utils/ipfs";
import rosBag, { getRosbag } from "./rosBag";
import getRobonomics from "./robonomics";
import config from "../config";

export async function genRosbagIpfs(data) {
  const bag = await getRosbag(data);
  const hash = (await tools.add(bag)).toString();
  await axios.get(`${config.IPFS_GATEWAY}${hash}`);
  return hash;
}

export async function readRosbagIpfs(hash, cb, topics = {}) {
  const r = await tools.cat(hash);
  return rosBag(new Blob([r]), cb, topics);
}

export const watchTx = (web3, tx) => {
  const transactionReceiptAsync = (resolve, reject) => {
    web3.eth.getTransactionReceipt(tx, (error, receipt) => {
      if (error) {
        reject(error);
      } else if (
        receipt === null ||
        (receipt.status === "0x1" && receipt.blockNumber === null)
      ) {
        setTimeout(() => transactionReceiptAsync(resolve, reject), 5000);
      } else {
        resolve(receipt);
      }
    });
  };
  if (Array.isArray(tx)) {
    return Promise.all(tx.map((oneTx) => watchTx(oneTx)));
  } else if (typeof tx === "string") {
    return new Promise(transactionReceiptAsync);
  }
  throw new Error(`Invalid Type: ${tx}`);
};

export const intFormat = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const floatFormat = (x) => {
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
};

const requestsIpns = new Set();
export const getDataByIpns = (hash, force = true) => {
  if (requestsIpns.has(hash) || force === false) {
    return Promise.resolve(false);
  }
  requestsIpns.add(hash);
  return axios
    .get(`https://ipfs.io/ipns/${hash}`)
    .then((r) => {
      requestsIpns.delete(hash);
      return r.data;
    })
    .catch(() => {
      requestsIpns.delete(hash);
      return false;
    });
};
