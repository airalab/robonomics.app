import { ref, watch } from "vue";
import { useRobonomics } from "./useRobonomics";

export const useBalance = (account) => {
  const balance = ref(null);
  const robonomics = useRobonomics();
  let unsubscribe;
  watch(account, async () => {
    if (unsubscribe) {
      unsubscribe();
    }
    unsubscribe = await robonomics.account.getBalance(account.value, (r) => {
      balance.value = r.free.sub(r.feeFrozen).toNumber();
    });
  });
  return { balance, unsubscribe };
};
