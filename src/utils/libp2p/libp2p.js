import { noise } from "@chainsafe/libp2p-noise";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { identify } from "@libp2p/identify";
import { mplex } from "@libp2p/mplex";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { multiaddr } from "@multiformats/multiaddr";
import { createLibp2p } from "libp2p";
import { createHa } from "./ha";

export async function createNode() {
  const node = await createLibp2p({
    addresses: {
      listen: ["/webrtc"]
    },
    transports: [
      webSockets({
        filter: filters.all
      }),
      webRTC(),
      circuitRelayTransport()
    ],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    services: {
      identify: identify(),
      ha: createHa()
    },
    connectionGater: {
      denyDialMultiaddr: () => {
        return false;
      }
    },
    connectionManager: {
      minConnections: 0
    }
  });

  return node;
}

export function checkLocalUri(uri) {
  return new Promise((res, rej) => {
    const timeoutId = setTimeout(() => {
      rej(new Error("timeout"));
    }, 10000);
    const ws = new WebSocket(uri);
    ws.addEventListener("error", () => {
      clearTimeout(timeoutId);
      rej(new Error("connect"));
    });
    ws.addEventListener("open", () => {
      ws.close();
      clearTimeout(timeoutId);
      res();
    });
  });
}
function relay(peer_id) {
  return `/dns4/libp2p-relay.robonomics.network/tcp/443/wss/p2p/12D3KooWEmZfGh3HEy7rQPKZ8DpJRYfFcbULN97t3hGwkB5xPmjn/p2p-circuit/p2p/${peer_id}`;
  // return `/dns4/vol4.work.gd/tcp/443/wss/p2p/12D3KooWEmZfGh3HEy7rQPKZ8DpJRYfFcbULN97t3hGwkB5xPmjn/p2p-circuit/p2p/${result.peer_id}`
}
export async function getUriPeer(peer_id, peer_address) {
  if (peer_address) {
    const localMultiaddr = multiaddr(peer_address);
    const address = localMultiaddr.nodeAddress();
    if (localMultiaddr.protoNames().includes("ws")) {
      const wsUri = `ws://${address.address}:${address.port}`;
      try {
        await checkLocalUri(wsUri);
        return localMultiaddr;
      } catch (error) {
        console.log(error);
      }
    }
  }
  return relay(peer_id);
}

let node = null;
let connections = [];
let connection = null;

export async function start() {
  if (node) {
    return node;
  }
  node = await createNode();
  await node.start();
  console.log(`Node started with id ${node.peerId.toString()}`);

  function updateConnectionsList() {
    connections = node.getConnections().map((item) => {
      return item.remoteAddr.toString();
    });
    console.log("Update Connections List", connections);
  }

  node.addEventListener("connection:open", (event) => {
    console.log("connected", event.detail.remoteAddr.toString());
    updateConnectionsList();
  });

  node.addEventListener("connection:close", (event) => {
    console.log("disconected", event.detail.remoteAddr.toString());
    updateConnectionsList();
    setTimeout(() => {
      if (
        connection &&
        event.detail.remoteAddr.toString() === connection.remoteAddr.toString()
      ) {
        console.log("reconnect");
        reconnect(connection.remoteAddr.toString());
      }
    }, 1000);
  });

  return node;
}

export async function reconnect(addr) {
  try {
    await connect(addr);
  } catch (error) {
    console.log(error);
    setTimeout(async () => {
      if (addr && !connections.includes(addr)) {
        await reconnect(addr);
      }
    }, 3000);
  }
}

export async function connect(addr) {
  if (!connections.includes(addr)) {
    const listenerMultiaddr = multiaddr(addr);
    connection = await node.dial(listenerMultiaddr);
  }
}

export async function disconnect() {
  if (connection) {
    await connection.close();
  }
  connection = null;
}

export function request(data) {
  if (node && connection) {
    return node.services.ha.request(connection, "/call", data);
  }
  throw new Error("error");
}
