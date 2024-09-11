import { ref } from "vue";
import { useRobonomics } from "./useRobonomics";

export const useAccount = () => {
  const account = ref(null);
  const { accountManager } = useRobonomics();
  if (accountManager.account) {
    account.value = accountManager.account.address;
  }
  const unsubscribe = accountManager.onChange((res) => {
    account.value = res.address;
  });
  return { account, unsubscribe };
};
