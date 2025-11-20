import configApp from "@/config";
import { usePolkadotApi } from "robonomics-interface-vue";
import { useAccount } from "robonomics-interface-vue/account";
import { ref, watch } from "vue";

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
 * @param api - API instance.
 * @returns {Promise<number>} - The total number of digital twins.
 */
export const getTotal = async (api) => {
  return await api.query.digitalTwin.total();
};

/**
 * Queries the digital twin IDs for a given account address, starting from a given index.
 * The function returns an object containing the total number of digital twins and the list of twin IDs.
 *
 * @param api - API instance.
 * @param {string} address - The account address.
 * @param {number} [startIndex=0] - The starting index for the query.
 * @returns {Promise<Object>} - An object containing the total number of digital twins and the list of twin IDs.
 */
const twinsByAccount = async (api, address, startIndex = 0) => {
  const twins = [];
  const total = await getTotal(api);
  for (let id = startIndex; id < total; id++) {
    const owner = await api.query.digitalTwin.owner(id);
    if (owner === address) {
      twins.push(id);
    }
  }
  return { total, twins };
};

/**
 * Queries the digital twin IDs for a given account address and stores them in local storage.
 *
 * @param api - API instance.
 * @param {string} address - The account address.
 * @returns {Promise<number[]>} - The list of digital twin IDs.
 */
export const loadTwins = async (api, address) => {
  const { total, twins } = await twinsByAccount(api, address);
  setCache(address, total, twins);
  return twins;
};

/**
 * Find and return the first token address in the list of twins
 *
 * @param api - API instance.
 * @param {number[]} twins
 * @return {string|null}
 */
const findByToken = async (api, twins, lookingToken) => {
  for (const twinId of twins) {
    const twin = await api.query.digitalTwin.digitalTwin(twinId);
    for (const token in twin) {
      if (token === lookingToken) {
        return twin[token];
      }
    }
  }
  return null;
};

/**
 * Returns the address of digital twin for the given account
 *
 * @param {boolean} [force=false] - if true, will immediately run the query
 * @returns {{ address: Ref<string|null>, isFind: Ref<boolean>, runFind: () => void }}
 */
export function useFind(token, force = false) {
  const { isConnected: isReady, instance: robonomics } = usePolkadotApi();
  const { account } = useAccount();

  const address = ref();
  const isFind = ref(false);

  const load = async (account) => {
    const result = getCache(account);
    let startIndex = 0;
    if (result.total !== false) {
      const total = await getTotal(robonomics.api);
      if (total === result.total) {
        address.value = await findByToken(robonomics.api, result.twins, token);
        return;
      } else {
        startIndex = result.total;
      }
    }
    const twins = await loadTwins(robonomics.api, account.value, startIndex);
    address.value = await findByToken(robonomics.api, twins, token);
  };

  const runFind = () => {
    watch(
      [account, isReady],
      async ([account, isReady]) => {
        if (account && isReady) {
          isFind.value = true;
          await load(account);
          isFind.value = false;
        }
      },
      { immediate: true }
    );
  };
  if (force) {
    runFind();
  }

  return {
    address,
    isFind,
    runFind
  };
}
