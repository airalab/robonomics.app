let config = {
  ipfs: {
    fallback: {
      repo: "ipfs/robonomics/4",
      relay: {
        enabled: true,
        hop: {
          enabled: true
        }
      },
      // EXPERIMENTAL: {
      //   pubsub: true
      // },
      config: {
        Addresses: {
          Swarm: [
            "/dns4/1.webrtcstar.aira.life/tcp/443/wss/p2p-webrtc-star/",
            "/dns4/2.webrtcstar.aira.life/tcp/443/wss/p2p-webrtc-star/",
            "/dns4/3.webrtcstar.aira.life/tcp/443/wss/p2p-webrtc-star/"
          ]
        },
        Bootstrap: [
          "/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
          "/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
          "/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm",
          "/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
          "/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic",
          "/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6",
          "/dns4/1.pubsub.aira.life/tcp/443/wss/ipfs/QmdfQmbmXt6sqjZyowxPUsmvBsgSGQjm4VXrV7WGy62dv8",
          "/dns4/2.pubsub.aira.life/tcp/443/wss/ipfs/QmPTFt7GJ2MfDuVYwJJTULr6EnsQtGVp8ahYn9NSyoxmd9",
          "/dns4/3.pubsub.aira.life/tcp/443/wss/ipfs/QmWZSKTEQQ985mnNzMqhGCrwQ1aTA6sxVsorsycQz9cQrw"
        ]
      }
    },
    // cdn: "https://unpkg.com/ipfs@0.34.0/dist/index.min.js",
    // cdn: "https://unpkg.com/ipfs@0.40.0/dist/index.min.js",
    // cdn: "https://unpkg.com/ipfs@0.48.1/dist/index.min.js",
    // cdn: "https://unpkg.com/ipfs@0.46.0/dist/index.min.js",
    cdn: "https://unpkg.com/ipfs@0.52.0/dist/index.min.js",
    permission: [
      "id",
      "files.cat",
      "files.add",
      "pubsub.peers",
      "pubsub.publish",
      "pubsub.subscribe",
      "swarm.peers",
      "swarm.connect"
    ]
  },
  statusPeers: [
    "QmdfQmbmXt6sqjZyowxPUsmvBsgSGQjm4VXrV7WGy62dv8",
    "QmPTFt7GJ2MfDuVYwJJTULr6EnsQtGVp8ahYn9NSyoxmd9",
    "QmWZSKTEQQ985mnNzMqhGCrwQ1aTA6sxVsorsycQz9cQrw"
  ]
};

export function setConfig({ ipfs, robonomics, statusPeers }) {
  config = {
    ipfs: {
      ...config.ipfs,
      fallback: ipfs.fallback || config.ipfs.fallback,
      permission: ipfs.permission || config.ipfs.permission
    },
    statusPeers: statusPeers || config.statusPeers,
    robonomics:
      robonomics ||
      function () {
        throw new Error("bad config");
      }
  };
}

export default function () {
  return config;
}
