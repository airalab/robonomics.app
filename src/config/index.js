export const VERSION = 5;
export default {
  API_KYC: 'https://civic.robonomics.network',
  STATISTICS_API: 'https://devjs-01.corp.aira.life:3004',
  NETWORK: 1,
  AMBIX: {
    AIR: '0xA2f4FCb0FDe2dD59f7a1873e121bc5623e3164Eb',
    AIR_DECIMALS: 0,
    AIR_KYC: '0x2a3A07d241eda9d573A6b666E9Fc359666cf7b39',
    AIR_KYC_DECIMALS: 0,
    XRT: '0x7dE91B204C1C737bcEe6F000AAA6569Cf7061cb7',
    XRT_DECIMALS: 9,
    AMBIX1: '0x6DD9A2c5B304135C47A9dBCfA7728BFD403f9DD6',
    AMBIX2: '0x06d77D039a6bD049fc9E651b7ecBB2694AC1F96f'
  },
  CIVIC_APP_ID: 'WUja346hS',
  VERSION: VERSION,
  START_NODES: [],
  FACTORY: {
    name: 'factory.' + VERSION + '.robonomics.eth',
    address: '0x7e384AD1FE06747594a6102EE5b377b273DC1225'
  },
  XRT: {
    name: 'xrt.' + VERSION + '.robonomics.eth',
    address: '0x7dE91B204C1C737bcEe6F000AAA6569Cf7061cb7'
  },
  NET_TOPICS: [
    'graph.' + VERSION + '.robonomics.eth',
    'graph.' + VERSION + '.robonomics.sid'
  ],
  ENS: '0x314159265dD8dbb310642f98f50C066173C1259b',
  IPFS_CONFIG: {
    repo: 'ipfs/robonomics-status/1',
    relay: {
      enabled: true,
      hop: {
        enabled: true
      }
    },
    EXPERIMENTAL: {
      pubsub: true
    },
    config: {
      Addresses: {
        Swarm: [
          '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
          '/dns4/1.wsstar.aira.life/tcp/443/wss/p2p-websocket-star/',
          '/dns4/2.wsstar.aira.life/tcp/443/wss/p2p-websocket-star/'
        ]
      },
      Bootstrap: [
        '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
        '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
        '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
        '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
        '/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
        '/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
        '/dns4/1.pubsub.aira.life/tcp/443/wss/ipfs/QmdfQmbmXt6sqjZyowxPUsmvBsgSGQjm4VXrV7WGy62dv8',
        '/dns4/2.pubsub.aira.life/tcp/443/wss/ipfs/QmPTFt7GJ2MfDuVYwJJTULr6EnsQtGVp8ahYn9NSyoxmd9'
      ]
    }
  },
  ROBONOMICS: {
    chains: {
      1: {
        ens: '',
        ensSuffix: 'eth'
      }
    },
    model: 'QmfCcLKrTCuXsf6bHbVupVv4zsbs6kjqTQ7DRftGqMLjdW',
    objective: 'Qmbm3o2wkqseSEi5F69CPAuDrsKnrwTJ3HN5FVLPgLHKUm',
    result: 'QmRnbvYL4ehmVnuXQbB54ZvSzrrWRxVsBBx1gKbDKLd6dK'
  }
};
