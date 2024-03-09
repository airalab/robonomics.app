import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { multiaddr } from "@multiformats/multiaddr";
import { createLibp2p } from "libp2p";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { identify } from "@libp2p/identify";
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

let node = null;
let connections = [];
let connection = null;

export async function start() {
  if (node) {
    return;
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
    if (
      event.detail.remoteAddr.toString() === connection.remoteAddr.toString()
    ) {
      reconnect(connection.remoteAddr.toString());
    }
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
  const listenerMultiaddr = multiaddr(addr);
  connection = await node.dial(listenerMultiaddr);
}

export function request(data) {
  if (node && connection) {
    return node.services.ha.request(connection, "/call", data);
  }
  throw new Error("error");
}
