import robonomics from "../robonomics";
import { ref } from "vue";

export const useBlock = () => {
  const block = ref(null);

  (async () => {
    block.value = (
      await robonomics.api.rpc.chain.getBlock()
    ).block.header.number.toString();
  })();

  const unsubscribe = robonomics.onBlock((res) => {
    block.value = res;
  });

  return { block, unsubscribe };
};
