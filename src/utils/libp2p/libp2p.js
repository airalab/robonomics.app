import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { identify } from "@libp2p/identify";
import { webRTCDirect } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import { multiaddr } from "@multiformats/multiaddr";
import { createLibp2p } from "libp2p";
import { createHa } from "./ha";

let node = null;
let connections = [];
let connection = null;

async function createNode() {
  const node = await createLibp2p({
    transports: [webSockets(), webRTCDirect(), circuitRelayTransport()],
    streamMuxers: [yamux()],
    connectionEncrypters: [noise()],
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
        reconnect(connection.remoteAddr);
      }
    }, 10000);
  });

  return node;
}

export async function connectMultiaddress(peer_multiaddress) {
  const direct = [];
  const circuit = [];
  peer_multiaddress = peer_multiaddress
    .filter((item) => item)
    .map((item) => multiaddr(item));
  for (const item of peer_multiaddress) {
    if (item.getComponents().find((item) => item.name === "p2p-circuit")) {
      circuit.push(item);
    } else {
      direct.push(item);
    }
  }
  console.log({
    direct: direct.map((item) => item.toString()),
    circuit: circuit.map((item) => item.toString())
  });
  const s = () => {};
  if (direct.length > 0) {
    console.log("connect to direct");
    return await connect(direct, 10000);
  }
  if (circuit.length > 0) {
    console.log("connect to circuit");
    return await connect(circuit, 10000);
  }
  return false;
}

async function reconnect(addr) {
  try {
    console.log("reconnect");
    await connect([addr]);
  } catch (error) {
    console.log(error);
    // setTimeout(async () => {
    //   if (addr && !connections.includes(addr)) {
    //     await reconnect(addr);
    //   }
    // }, 3000);
  }
}

async function connect(addrs, timeout = 30000) {
  connection = await node.dial(addrs, { signal: AbortSignal.timeout(timeout) });
  return connection.remoteAddr;
}

export async function disconnect() {
  if (connection) {
    await connection.close();
  }
  connection = null;
}

export function request(data, protocol = "/call") {
  if (node && connection) {
    return node.services.ha.request(connection, protocol, data);
  }
  throw new Error("error");
}
