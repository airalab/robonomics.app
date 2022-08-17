import robonomics from "../robonomics";
import { ref } from "vue";

export const useSend = () => {
  const result = ref(null);
  const error = ref(null);
  const process = ref(false);
  const send = async (tx, subscription = false) => {
    result.value = null;
    error.value = null;
    process.value = true;
    try {
      if (subscription) {
        robonomics.accountManager.useSubscription(subscription);
      }
      result.value = await robonomics.accountManager.signAndSend(tx);
      console.log("tx", result.value.block, result.value.tx);
    } catch (e) {
      error.value = e.message;
    }
    process.value = false;
    if (subscription) {
      robonomics.accountManager.useSubscription(false);
    }
    return result;
  };
  return { error, process, result, send };
};
