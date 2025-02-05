import { useAccount } from "@/hooks/useAccount";
import { useRobonomics } from "@/hooks/useRobonomics";
import { ref, watch } from "vue";
import { getCache, getTotal, loadTwins } from "../dtwin/dtwin.js";

/**
 * Find and return the first altruist token address in the list of twins
 *
 * @param {Robonomics} robonomics
 * @param {number[]} twins
 * @return {string|null}
 */
const findTokenAltruist = async (robonomics, twins) => {
  for (const twinId of twins) {
    const twin = await robonomics.twin.getTwin(twinId);
    for (const token in twin) {
      if (
        token ===
        "0x000000000000000000000000000000000000000000000000616c747275697374"
      ) {
        return twin[token];
      }
    }
  }
  return null;
};

/**
 * Returns the address of the Altruist digital twin for the given account
 *
 * @param {boolean} [force=false] - if true, will immediately run the query
 * @returns {{ address: Ref<string|null>, isFind: Ref<boolean>, runFind: () => void }}
 */
export function useFindAltruist(force = false) {
  const { isReady, getInstance } = useRobonomics();
  const { account } = useAccount();
  const address = ref();
  const isFind = ref(false);

  const load = async (account) => {
    const robonomics = getInstance();
    const result = getCache(account);
    let startIndex = 0;
    if (result.total !== false) {
      const total = await getTotal(robonomics);
      if (total === result.total) {
        address.value = await findTokenAltruist(robonomics, result.twins);
        return;
      } else {
        startIndex = result.total;
      }
    }
    const twins = await loadTwins(robonomics, account, startIndex);
    address.value = await findTokenAltruist(robonomics, twins);
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
