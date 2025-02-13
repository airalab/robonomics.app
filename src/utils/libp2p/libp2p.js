import { noise } from "@chainsafe/libp2p-noise";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { identify } from "@libp2p/identify";
// import { keychain } from "@libp2p/keychain";
// import { defaultLogger } from "@libp2p/logger";
import { mplex } from "@libp2p/mplex";
// import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { multiaddr } from "@multiformats/multiaddr";
// import { LevelDatastore } from "datastore-level";
// import { Key } from "interface-datastore";
import { createLibp2p } from "libp2p";
import { createHa } from "./ha";

export async function createNode() {
  // const selfKey = new Key("/pkcs8/self");
  // const datastore = new LevelDatastore(`libp2p/data`);
  // const chain = keychain()({
  //   datastore: datastore,
  //   logger: defaultLogger()
  // });
  // let peerId;
  // if (await datastore.has(selfKey)) {
  //   peerId = await chain.exportPeerId("self");
  // }
  const node = await createLibp2p({
    // peerId: peerId,
    // addresses: {
    //   listen: ["/webrtc"]
    // },
    transports: [
      webSockets({
        filter: filters.all
      }),
      // webRTC(),
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
  // if (chain != null && !(await datastore.has(selfKey))) {
  //   await chain.importPeer("self", node.peerId);
  // }
  return node;
}
export function defaultRelay(peer_id) {
  return multiaddr(
    `/dns4/libp2p-relay-1.robonomics.network/tcp/443/wss/p2p/12D3KooWEMFXXvpZUjAuj1eKR11HuzZTCQ5HmYG9MNPtsnqPSERD/p2p-circuit/p2p/${peer_id}`
  );
}
export async function connectMultiaddress(peer_id, peer_multiaddress) {
  if (peer_multiaddress.length > 0) {
    const localMultiaddrs = [];
    const circuit = [];
    for (const peer_multiaddr of peer_multiaddress) {
      const localMultiaddr = multiaddr(peer_multiaddr);
      const protos = localMultiaddr.protoNames();
      if (protos.includes("ws") || protos.includes("wss")) {
        if (protos.includes("p2p-circuit")) {
          circuit.push(localMultiaddr);
        } else if (
          window.location.protocol !== "https:" ||
          protos.includes("wss")
        ) {
          localMultiaddrs.push(localMultiaddr);
        }
      }
    }

    if (localMultiaddrs.length > 0) {
      for (const addr of localMultiaddrs) {
        try {
          await connect(addr);
          return addr;
        } catch (error) {
          console.log(error);
        }
      }
    }

    if (circuit.length > 0) {
      for (const addr of circuit) {
        try {
          await connect(addr);
          return addr;
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
  try {
    const addr = defaultRelay(peer_id);
    await connect(addr);
    return addr;
  } catch (error) {
    console.log(error);
  }
  return false;
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
    }, 10000);
  });

  return node;
}

export async function reconnect(addr) {
  try {
    await connect(addr);
  } catch (error) {
    console.log(error);
    // setTimeout(async () => {
    //   if (addr && !connections.includes(addr)) {
    //     await reconnect(addr);
    //   }
    // }, 3000);
  }
}
export async function connect(addr) {
  console.log("connect to", addr.toString());
  if (!connections.includes(addr)) {
    const listenerMultiaddr = multiaddr(addr);
    connection = await node.dial(listenerMultiaddr);
  }
  return addr;
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
