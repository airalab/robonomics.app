import configApp from "@/config";
import { useAccount } from "@/hooks/useAccount";
import { useDevices } from "@/hooks/useDevices";
import { useRobonomics } from "@/hooks/useRobonomics";
import { useSend } from "@/hooks/useSend";
import {
  cidToHex,
  hexToCid,
  stringToHex
} from "robonomics-interface/dist/utils";
import { ref, toRef, watch } from "vue";

/**
 * Stores the list of digital twin IDs and the total count of digital twins for
 * the given account in the local storage. The storage key is based on the
 * current parachain endpoint and the account address.
 *
 * @param {string} account - The account address.
 * @param {number} total - The total number of digital twins.
 * @param {string[]} twins - The list of digital twin IDs.
 */
const setCache = (account, total, twins) => {
  const endpoint =
    localStorage.getItem("rpc-parachain") || configApp.default_rpc_endpoint;
  localStorage.setItem(
    `twins:${new URL(endpoint).host}:${account}`,
    JSON.stringify({ total, twins })
  );
};

/**
 * Retrieves the cached digital twin data for a given account from local storage.
 * The storage key is based on the current parachain endpoint and the account address.
 *
 * @param {string} account - The account address.
 * @returns {Object} - An object containing the total number of digital twins and the list of twin IDs.
 *                     If no cache is found, returns an object with total set to false and twins as an empty array.
 */
export const getCache = (account) => {
  const endpoint =
    localStorage.getItem("rpc-parachain") || configApp.default_rpc_endpoint;
  try {
    const result = JSON.parse(
      localStorage.getItem(`twins:${new URL(endpoint).host}:${account}`)
    );
    if (result) {
      return result;
    }
  } catch (e) {
    console.log(e);
  }
  return { total: false, twins: [] };
};

/**
 * Queries the total number of digital twins in the parachain.
 *
 * @param {Robonomics} robonomics - The Robonomics API instance.
 * @returns {Promise<number>} - The total number of digital twins.
 */
export const getTotal = async (robonomics) => {
  return await robonomics.twin.getTotal();
};

/**
 * Queries the digital twin IDs for a given account address, starting from a given index.
 * The function returns an object containing the total number of digital twins and the list of twin IDs.
 *
 * @param {Robonomics} robonomics - The Robonomics API instance.
 * @param {string} address - The account address.
 * @param {number} [startIndex=0] - The starting index for the query.
 * @returns {Promise<Object>} - An object containing the total number of digital twins and the list of twin IDs.
 */
const twinsByAccount = async (robonomics, address, startIndex = 0) => {
  const twins = [];
  const total = await getTotal(robonomics);
  for (let id = startIndex; id < total; id++) {
    const owner = await robonomics.twin.getOwner(id);
    if (owner === address) {
      twins.push(id);
    }
  }
  return { total, twins };
};

/**
 * Queries the digital twin IDs for a given account address and stores them in local storage.
 *
 * @param {Robonomics} robonomics - The Robonomics API instance.
 * @param {string} address - The account address.
 * @returns {Promise<number[]>} - The list of digital twin IDs.
 */
export const loadTwins = async (robonomics, address) => {
  const { total, twins } = await twinsByAccount(robonomics, address);
  setCache(address, total, twins);
  return twins;
};

/**
 * Converts a given token (hex-string) to a utf-8 encoded string.
 * @param {string} token - A token (hex-string).
 * @returns {string} The utf-8 encoded string.
 */
export const tokenToString = (token) => {
  token = token.replace(/^0x/, "").replace(/^00+/, "");
  if (token.length % 2 !== 0) {
    token = "0" + token;
  }
  return Buffer.from(token, "hex").toString("utf8");
};

/**
 * Converts a given token (hex-string) to a Content-Addressed Identifier (CID).
 * @param {string} token - A token (hex-string).
 * @returns {string} The Content-Addressed Identifier (CID).
 */
export const tokenToCid = (token) => {
  return hexToCid(token);
};

/**
 * A hook that returns the digital twin data for a given digital twin ID.
 * The hook listens to changes of the given `id` ref and updates the `twin` ref
 * with the corresponding digital twin data.
 *
 * @param {Ref<number>} id - The digital twin ID.
 * @returns {Object} - An object containing a `twin` ref with the digital twin data.
 */
export function useTwin(id) {
  const { getInstance } = useRobonomics();
  const twin = ref();

  watch(
    id,
    async (twinId) => {
      if (twinId >= 0) {
        const robonomics = getInstance();
        twin.value = await robonomics.twin.getTwin(twinId);
      }
    },
    { immediate: true }
  );

  return { twin };
}

/**
 * A hook that returns the list of digital twin IDs for a given account address.
 * The hook listens to changes of the given `account` ref and updates the `twins` ref
 * with the corresponding list of digital twin IDs. The `isLoading` ref indicates if the
 * data is being loaded.
 *
 * @param {boolean} [force=false] - If true, will immediately run the query.
 * @returns {Object} - An object containing a `twins` ref with the list of digital twin IDs,
 * a `isLoading` ref indicating if the data is being loaded, and a `run` function to run
 * the query.
 */
export function useTwins(force = false) {
  const { isReady, getInstance } = useRobonomics();
  const { account } = useAccount();
  const twins = ref();
  const isLoading = ref(false);

  const load = async (account) => {
    const robonomics = getInstance();
    const result = getCache(account);
    let startIndex = 0;
    if (result.total !== false) {
      const total = await getTotal(robonomics);
      if (total === result.total) {
        twins.value = result.twins;
        return;
      } else {
        startIndex = result.total;
      }
    }
    twins.value = await loadTwins(robonomics, account, startIndex);
  };

  const run = () => {
    watch(
      [account, isReady],
      async ([account, isReady]) => {
        if (account && isReady) {
          isLoading.value = true;
          await load(account);
          isLoading.value = false;
        }
      },
      { immediate: true }
    );
  };
  if (force) {
    run();
  }

  return {
    twins,
    isLoading,
    run
  };
}

/**
 * A hook that returns an object with two functions: `create` and `setSource`.
 * Both functions return a transaction hash after sending the transaction.
 *
 * @function create - Creates a new digital twin. The function takes no arguments.
 * @function setSource - Sets the source of a digital twin. The function takes three arguments:
 *   - `id`: The ID of the digital twin.
 *   - `topic`: The topic of the source. Can be a CID or a string.
 *   - `source`: The source of the digital twin.
 */
export function useTwinAction(subscribe) {
  const { getInstance } = useRobonomics();
  const transaction = useSend();
  const { account } = useAccount();
  if (!subscribe) {
    subscribe = account;
  } else {
    subscribe = toRef(subscribe);
  }
  const devices = useDevices(subscribe);

  const create = async () => {
    const robonomics = getInstance();
    const call = robonomics.twin.create();
    const tx = transaction.createTx();
    if (devices.devices.value.includes(account.value)) {
      await transaction.send(tx, call, subscribe.value);
    } else {
      await transaction.send(tx, call);
    }
    return tx;
  };

  const setSource = async (id, topic, source) => {
    const robonomics = getInstance();
    let hex = topic;
    if (!topic.startsWith("0x")) {
      try {
        hex = cidToHex(topic);
      } catch (_) {
        hex = stringToHex(topic);
      }
    }
    const call = robonomics.twin.setSource(id, hex, source);
    const tx = transaction.createTx();
    if (devices.devices.value.includes(account.value)) {
      await transaction.send(tx, call, subscribe.value);
    } else {
      await transaction.send(tx, call);
    }
    return tx;
  };

  return { create, setSource };
}
