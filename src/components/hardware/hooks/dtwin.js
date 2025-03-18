import { useAccount } from "@/hooks/useAccount";
import { useRobonomics } from "@/hooks/useRobonomics";
import { getCache, getTotal, loadTwins } from "@/views/dtwin/dtwin.js";
import { ref, watch } from "vue";

/**
 * Find and return the first token address in the list of twins
 *
 * @param {Robonomics} robonomics
 * @param {number[]} twins
 * @return {string|null}
 */
const findByToken = async (robonomics, twins, lookingToken) => {
  for (const twinId of twins) {
    const twin = await robonomics.twin.getTwin(twinId);
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
        address.value = await findByToken(robonomics, result.twins, token);
        return;
      } else {
        startIndex = result.total;
      }
    }
    const twins = await loadTwins(robonomics, account, startIndex);
    address.value = await findByToken(robonomics, twins, token);
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
