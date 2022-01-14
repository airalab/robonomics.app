import { Robonomics, AccountManager } from "./robonomics-substrate";
import config from "@/config/substrate";

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
