import { Robonomics, AccountManager } from "./robonomics-substrate";

const config = {
  robonomics: {
    name: "robonomics",
    endpoint: "wss://kusama.rpc.robonomics.network/",
    // endpoint: "ws://127.0.0.1:9944",
    types: {
      Record: "Vec<u8>",
      RingBufferIndex: { start: "Compact<u64>", end: "Compact<u64>" },
      RingBufferItem: "(Compact<Moment>,Record)",
      Parameter: "bool",
      LaunchParameter: "bool",
      UnlockChunk: {
        value: "Compact<Balance>",
        moment: "Compact<Moment>"
      },
      StakerLedger: {
        stash: "AccountId",
        total: "Compact<Balance>",
        active: "Compact<Balance>",
        unlocking: "Vec<UnlockChunk<Balance, BlockNumber>>",
        claimed_rewards: "BlockNumber"
      }
    }
  },
  ipci: {
    name: "ipci",
    endpoint: "wss://ipci.rpc.robonomics.network",
    types: {
      EverUSDBalance: "u64",
      BondPeriod: "u64",
      Record: "Vec<u8>",
      RingBufferIndex: { start: "Compact<u64>", end: "Compact<u64>" },
      RingBufferItem: "(Compact<Moment>,Record)",
      Parameter: "bool",
      LaunchParameter: "bool"
    }
  }
};

export function createInstance(name = "robonomics") {
  return new Promise((resolve, reject) => {
    const robonomics = new Robonomics(config[name]);
    robonomics.setAccountManager(new AccountManager());
    robonomics.onReady(async () => {
      try {
        await AccountManager.initPlugin({
          isDevelopment: true
        });
        robonomics.accountManager.onReady(() => {
          resolve(robonomics);
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}
