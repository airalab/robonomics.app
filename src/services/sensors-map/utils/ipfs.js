import axios from "axios";

let ipfs = null;

function getIpfs() {
  if (ipfs === null) {
    throw new Error("Ipfs not init");
  }
  return ipfs;
}

async function initFallback(config) {
  const node = await window.Ipfs.create(config);
  const info = await node.id();
  console.log("ipfs id " + info.id);
  window.ipfs = node;
  ipfs = node;
  return node;
}

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export async function init(config) {
  if (window.ipfs && window.ipfs.enable) {
    try {
      const node = await window.ipfs.enable({
        commands: config.permission,
      });
      await node.id();
      ipfs = node;
      return ipfs;
    } catch (e) {
      console.warn(e);
      return loadScript(config.cdn).then(() => initFallback(config.fallback));
    }
  }
  console.warn("not ipfs");
  return loadScript(config.cdn).then(() => initFallback(config.fallback));
}

export function cat(hash) {
  const node = getIpfs();
  return Promise.race([
    node.cat(hash),
    axios
      .get(`https://ipfs.infura.io/ipfs/${hash}`, { responseType: "blob" })
      .then((result) => {
        return result.data;
      }),
  ]);
}

export const tools = {
  async cat(hash) {
    const node = getIpfs();
    let bufs = [];
    for await (const buf of node.cat(hash)) {
      bufs.push(buf);
    }
    return Buffer.concat(bufs);
  },
  async add(data) {
    const node = getIpfs();
    // const { cid } = await node.add(data);
    // return cid;
    for await (const { cid } of node.add(data)) {
      return cid.toString();
    }
  },
};

export default getIpfs;
