import { Robonomics, AccountManager } from "./robonomics-substrate";

const config = {
  local: {
    name: "local",
    endpoint: "ws://127.0.0.1:9944",
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
  robonomics: {
    name: "robonomics",
    endpoint: "wss://main.frontier.rpc.robonomics.network/",
    // endpoint: "wss://kusama.rpc.robonomics.network/",
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

export async function initPlugin(isDevelopment = false) {
  if (AccountManager.isReady() || AccountManager.isError()) {
    return;
  }
  await AccountManager.initPlugin({
    // genesisHash: robonomics.api.genesisHash,
    isDevelopment
  });
}

export function createInstance(name = "robonomics") {
  const robonomics = new Robonomics(config[name]);
  robonomics.setAccountManager(new AccountManager());
  return robonomics;
}

export function getInstance(
  name = "robonomics",
  isWaitingAccount = true,
  providerListener = undefined
) {
  return new Promise((resolve, reject) => {
    let robonomics = null;
    try {
      robonomics = Robonomics.getInstance(name);
    } catch (_) {
      robonomics = createInstance(name);
    }

    if (providerListener) {
      robonomics.provider.on("error", (e) => {
        providerListener("error", e);
      });
      robonomics.provider.on("connected", () => {
        providerListener("connected");
      });
      robonomics.provider.on("disconnected", () => {
        providerListener("disconnected");
      });
    }

    robonomics.onReady(() => {
      if (isWaitingAccount) {
        robonomics.accountManager.onReady((e) => {
          if (e) {
            reject(e, robonomics);
          }
          resolve(robonomics);
        });
      } else {
        resolve(robonomics);
      }
    });
  });
}
