import { ref } from "vue";
import { useRobonomics } from "./useRobonomics";

export const useAccount = () => {
  const account = ref(null);
  const robonomics = useRobonomics();
  if (robonomics.accountManager.account) {
    account.value = robonomics.accountManager.account.address;
  }
  const unsubscribe = robonomics.accountManager.onChange((res) => {
    account.value = res.address;
  });
  return { account, unsubscribe };
};
