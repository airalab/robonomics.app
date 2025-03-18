import { useRobonomics } from "@/hooks/useRobonomics";
import { onUnmounted, ref, watch } from "vue";

/**
 * Hook to read and subscribe to Robonomics datalog events from a given address.
 *
 * @param {string} address - The Robonomics address to read.
 * @return {{log: Ref<Array<{moment: number, data: Array<{key: string, name: string, value: string}>, raw: string}>}, isLaoded: Ref<boolean>}}
 *         A reactive object containing the log and a boolean indicating if the log is loaded.
 */
export const useDatalog = (address, parser = (input) => input) => {
  const { isReady, getInstance } = useRobonomics();

  const isLaoded = ref(false);
  const log = ref([]);
  let unsubscribe;

  const read = async (address) => {
    const robonomics = getInstance();
    const data = await robonomics.datalog.read(address);
    return data.map((item) => {
      return {
        moment: item[0].toNumber(),
        data: parser(item[1].toHuman()),
        raw: item[1].toHuman()
      };
    });
  };

  const listener = async (address) => {
    const robonomics = getInstance();
    unsubscribe = await robonomics.datalog.on({}, (result) => {
      for (const item of result) {
        if (item.data[0].toHuman() === address) {
          log.value.push({
            moment: item.data[1].toNumber(),
            data: parser(item.data[2].toHuman()),
            raw: item.data[2].toHuman()
          });
        }
      }
    });
  };

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  watch(
    [address, isReady],
    async ([address, isReady]) => {
      if (isReady) {
        log.value = await read(address);
        await listener(address);
        isLaoded.value = true;
      }
    },
    { immediate: true }
  );

  return {
    log,
    isLaoded
  };
};
