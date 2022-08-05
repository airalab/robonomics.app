import robonomics from "../robonomics";
import { ref } from "vue";

export const useAccount = async () => {
  const block = ref(null);
  const unsubscribe = await robonomics.onBlock(async (res) => {
    block.value = res;
  });
  return { block, unsubscribe };
};
