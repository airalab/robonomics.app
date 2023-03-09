import axios from "axios";
import { create } from "ipfs-core";
import Crust from "../utils/crust";

let node = null;

async function createNode(options) {
  if (node === null) {
    node = await create(options);
  }
  return node;
}

export async function addToInfura(content) {
  try {
    const formdata = new FormData();
    formdata.append("file", content);

    const result = await axios.post(
      `https://ipfs.infura.io:5001/api/v0/add?stream-channels=true`,
      formdata,
      {
        headers: { "Content-Type": "multipart/form-data" }
      }
    );

    console.log("infura add file", result.data.Hash);
    return result.data.Hash;
  } catch (error) {
    console.log(error);
  }
}

export async function addFile(name, content) {
  if (node === null) {
    throw new Error("ipfs not initialized");
  }
  try {
    await addToInfura(content);
  } catch (error) {
    console.log(error);
  }
  const fileToAdd = {
    path: name,
    content: content
  };
  const file = await node.add(fileToAdd);
  return file.cid.toString();
}

const CancelToken = axios.CancelToken;

let cancel;

export async function catFile(
  hash,
  gateway = "https://ipfs.io",
  options = {},
  attempts = 5
) {
  const url = new URL(gateway);
  gateway = url.origin;
  if (url.protocol === "http") {
    gateway = gateway.replace("http://", "https://");
  }
  try {
    console.log("gett");
    cancel = undefined;
    const result = await axios.get(`${gateway}/ipfs/${hash}`, {
      ...options,
      cancelToken: new CancelToken((c) => {
        cancel = c;
      })
    });
    return result.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      return;
    }
    if (attempts <= 0) {
      throw error;
    }
  }
  return await catFile(hash, gateway, options, attempts - 1);
}

export function cancelCatFile() {
  if (cancel) {
    cancel();
  }
}

export default {
  install: (app, options) => {
    app.config.globalProperties.$ipfs = createNode(options);
    app.config.globalProperties.$crust = new Crust();
  }
};
