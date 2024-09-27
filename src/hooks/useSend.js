import { ref } from "vue";
import { useRobonomics } from "./useRobonomics";
import { useSubscription } from "./useSubscription";

export const useSend = () => {
  const { isReady, getInstance, accountManager } = useRobonomics();
  const { getFreeWeightCalc } = useSubscription();

  const getCallWeight = async (tx, signer) => {
    if (!signer) {
      if (accountManager.account) {
        signer = accountManager.account.address;
      } else {
        throw new Error("Signer required");
      }
    }
    if (tx.hasPaymentInfo) {
      return (await tx.paymentInfo(signer)).weight.toNumber();
    }
    return 0;
  };

  const checkWeight = async (tx, owner) => {
    const freeWeightCalc = await getFreeWeightCalc(owner);
    if (freeWeightCalc < 0) {
      throw new Error(`Not found ledger ${owner}`);
    }
    const callWeight = await getCallWeight(tx);
    if (callWeight > freeWeightCalc) {
      throw new Error(
        `The origin account have no enough free weight to process these call. Call weight ${callWeight}, Free weight ${freeWeightCalc}`
      );
    }
  };

  const createTx = () => {
    const result = ref(null);
    const error = ref(null);
    const process = ref(false);
    return { error, process, result };
  };

  const send = async (tx, call, subscription = false) => {
    tx.result.value = null;
    tx.error.value = null;
    tx.process.value = true;
    if (!isReady.value) {
      tx.error.value = "Robonomics is not ready";
      tx.process.value = false;
      return;
    }
    const robonomics = getInstance();
    try {
      if (subscription) {
        await checkWeight(call, subscription);
        robonomics.accountManager.useSubscription(subscription);
      }
      const nonce = await robonomics.api.rpc.system.accountNextIndex(
        robonomics.accountManager.account.address
      );
      tx.result.value = await robonomics.accountManager.signAndSend(call, {
        nonce
      });
      console.log("tx", tx.result.value.block, tx.result.value.tx);
    } catch (e) {
      console.log(e);
      tx.error.value = e.message;
    }
    tx.process.value = false;
    if (subscription) {
      robonomics.accountManager.useSubscription(false);
    }
    return tx.result;
  };

  return { createTx, send };
};
