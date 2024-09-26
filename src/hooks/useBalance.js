import { ref, watch } from "vue";
import { useRobonomics } from "./useRobonomics";

export const useBalance = (account) => {
  const balance = ref(null);
  const { isReady, getInstance } = useRobonomics();
  let unsubscribe;
  watch([account, isReady], async () => {
    if (unsubscribe) {
      unsubscribe();
    }
    if (!isReady.value) {
      return;
    }
    const robonomics = getInstance();
    unsubscribe = await robonomics.account.getBalance(account.value, (r) => {
      balance.value = r.free.sub(r.frozen).toNumber();
    });
  });
  return { balance, unsubscribe };
};
