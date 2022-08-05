import robonomics from "../robonomics";
import { ref } from "vue";

export const useAccount = () => {
  const account = ref(null);
  if (robonomics.accountManager.account) {
    account.value = robonomics.accountManager.account.address;
  }
  const unsubscribe = robonomics.accountManager.onChange((res) => {
    account.value = res.address;
  });

  return { account, unsubscribe };
};
