import { ApiPromise, WsProvider } from "@polkadot/api";
import keyring from "@polkadot/ui-keyring";
import {
  web3FromSource,
  web3Accounts,
  web3Enable
} from "@polkadot/extension-dapp";
import {
  u8aToString,
  u8aToU8a,
  stringToHex,
  compactFromU8a
} from "@polkadot/util";
import { createTypeUnsafe, Bytes } from "@polkadot/types";
import { storageFromMeta } from "@polkadot/metadata";

export const config = {
  local: {
    url: "ws://127.0.0.1:9944",
    types: {
      Record: "Vec<u8>",
      TechnicalParam: "Vec<u8>",
      TechnicalReport: "Vec<u8>",
      EconomicalParam: {},
      ProofParam: "MultiSignature",
      LiabilityIndex: "u64",
      Parameter: "Vec<u8>"
    },
    keyring: {
      ss58Format: 42,
      isDevelopment: true,
      type: "ed25519"
    }
  },
  ipci: {
    url: "wss://substrate.ipci.io",
    types: {
      Record: "Vec<u8>"
    },
    keyring: {
      ss58Format: 32,
      isDevelopment: false,
      type: "ed25519"
    }
  },
  robonomics: {
    url: "wss://earth.rpc.robonomics.network",
    types: {
      Parameter: "Vec<u8>",
      RefCount: "u8",
      Record: "Vec<u8>",
      Address: "MultiAddress",
      LookupSource: "MultiAddress",
      TechnicalParam: "Vec<u8>",
      TechnicalReport: "Vec<u8>",
      EconomicalParam: "{}",
      ProofParam: "MultiSignature",
      LiabilityIndex: "u64",
      PersistedValidationData: {
        parent_head: "Vec<u8>",
        block_number: "u32",
        hrmp_mqc_heads: "Vec<(u32, Hash)>",
        dmq_mqc_head: "Hash",
        max_pov_size: "u32"
      },
      TransientValidationData: {
        max_code_size: "u32",
        max_head_data_size: "u32",
        balance: "Balance",
        code_upgrade_allowed: "Option<u32>",
        dmq_length: "u32"
      },
      ValidationData: {
        persistent: "PersistedValidationData",
        transient: "TransientValidationData"
      },
      InboundHrmpMessage: {
        send_at: "u32",
        data: "Vec<u8>"
      },
      InboundDownwardMessage: {
        send_at: "u32",
        msg: "Vec<u8>"
      },
      MessageIngestionType: {
        downward_messages: "Vec<InboundDownwardMessage>",
        horizontal_messages: "Vec<InboundHrmpMessage>"
      }
    },
    keyring: {
      ss58Format: 32,
      isDevelopment: false,
      type: "ed25519"
    }
  }
};

const provider = {
  local: null,
  ipci: null,
  robonomics: null
};
const api = {
  local: null,
  ipci: null,
  robonomics: null
};

export function getProvider(network = "robonomics") {
  if (provider[network]) {
    return provider[network];
  }
  provider[network] = new WsProvider(config[network].url);
  // provider.on("error", () => {
  //   console.log("err");
  // });
  return provider[network];
}
export async function getInstance(network = "robonomics") {
  if (api[network]) {
    return api[network];
  }
  api[network] = await ApiPromise.create({
    provider: getProvider(),
    types: config[network].types
  });
  return api[network];
}

let isInitAccounts = false;
export async function initAccounts(api) {
  if (!isInitAccounts) {
    try {
      await web3Enable("dapp");
      const accounts = await web3Accounts();
      const injectedAccounts = accounts.map(({ address, meta }) => ({
        address,
        meta
      }));
      keyring.loadAll(
        {
          genesisHash: api.genesisHash,
          ...config.keyring
        },
        injectedAccounts
      );
      isInitAccounts = true;
    } catch (e) {
      console.log(e);
    }
  }
}

export function getAccounts() {
  return keyring.getPairs();
}

export function getFirstAddressAccount() {
  const accounts = keyring.getPairs();
  return accounts[0].address;
}

export async function getAccount(api, address) {
  const account = keyring.getPair(address);
  if (account.meta.isInjected) {
    const injected = await web3FromSource(account.meta.source);
    api.setSigner(injected.signer);
    return account.address;
  }
  return account;
}

export function send(api, account, data) {
  return new Promise((resolve, reject) => {
    try {
      const tx = api.tx.datalog.record(data);
      let unsubscribe;
      tx.signAndSend(account, {}, (result) => {
        if (result.status.isInBlock) {
          unsubscribe();
          resolve({
            block: result.status.asInBlock.toString(),
            tx: tx.hash.toString()
          });
        }
        // if (result.status.isFinalized) {
        //   unsubscribe();
        //   resolve({
        //     block: result.status.asFinalized.toString(),
        //     tx: tx.hash.toString()
        //   });
        // }
      })
        .then((r) => {
          unsubscribe = r;
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}

function parseDataHex(api, value, skip) {
  const input = u8aToU8a(value);
  let cursor = 0 + skip.pos;
  const [offset, length] = compactFromU8a(input);
  let data = input.subarray(offset + cursor);
  const result = [];
  const countChanks = length.toNumber();
  let chank = 1;
  for (chank; chank <= countChanks && data.length > 0; chank++) {
    const timeBytes = data.subarray(0, 8);
    data = data.subarray(8);

    const timeType = createTypeUnsafe(
      api.registry,
      "MomentOf",
      [timeBytes],
      true
    );
    const value = new Bytes(api.registry, data);
    const dataBytes = data.subarray(0, value.encodedLength);
    data = data.subarray(value.encodedLength);

    if (
      !Object.prototype.hasOwnProperty.call(skip, "time") ||
      skip.time === 0 ||
      Number(timeType.toString()) > skip.time
    ) {
      const dataType = createTypeUnsafe(
        api.registry,
        "Vec<u8>",
        [dataBytes],
        true
      );
      result.push([timeType, dataType]);
    }
    cursor += 8 + value.encodedLength;
  }
  return [cursor, result];
}

export async function subscribeDatalog(
  address,
  cb,
  start = { pos: 0, time: Date.now() }
) {
  const api = await getInstance();
  const provider = getProvider();

  const metadata = await api.rpc.state.getMetadata();
  const fnMeta = storageFromMeta(api.registry, metadata);

  const params = [fnMeta.datalog.datalog, address];
  const paramsType = createTypeUnsafe(
    api.registry,
    "StorageKey",
    [params],
    true
  );

  let skip = start;
  const unsubscribeId = await provider.subscribe(
    "state_storage",
    "state_subscribeStorage",
    [[paramsType.toHex()]],
    (_, r) => {
      if (r) {
        const res = parseDataHex(api, r.changes[0][1], skip);
        skip.pos = res[0];
        skip.time = 0;
        if (res[1].length > 0) {
          cb(res[1]);
        }
      }
    }
  );
  return async function () {
    return await provider.unsubscribe(
      "state_storage",
      "state_unsubscribeStorage",
      unsubscribeId
    );
  };
}

export function toIpfsHash(data) {
  return u8aToString(data);
}

export function ipfsHashToHex(data) {
  return stringToHex(data);
}
