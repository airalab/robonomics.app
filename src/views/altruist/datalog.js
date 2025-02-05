import { useRobonomics } from "@/hooks/useRobonomics";
import { onUnmounted, ref, watch } from "vue";

const mapName = new Map([
  ["p1", "PM10"],
  ["p2", "PM2.5"],
  ["nm", "Noise Max."],
  ["na", "Noise Avg."],
  ["t", "Temperature"],
  ["p", "Pressure"],
  ["h", "Humidity"]
]);

/**
 * Given a key, return the corresponding name if the key exists in the map.
 * Otherwise, return the key itself.
 *
 * @param {string} key
 * @return {string}
 */
const getName = (key) => {
  const name = mapName.get(key);
  if (name) {
    return name;
  }
  return key;
};

/**
 * Parses a comma-separated string of key-value pairs into an array of objects.
 * Each object contains the original key, its mapped name from the mapName if available,
 * and the corresponding value.
 *
 * @param {string} data - A string containing key-value pairs separated by commas,
 *                        where each pair is separated by a colon.
 * @return {Array<{key: string, name: string, value: string}>} - An array of objects
 *                                                              with parsed key, name, and value.
 */
const parseData = (data) => {
  return data.split(",").map((item) => {
    const [key, value] = item.split(":");
    return {
      key,
      name: getName(key),
      value
    };
  });
};

/**
 * Hook to read and subscribe to Robonomics datalog events from a given address.
 *
 * @param {string} address - The Robonomics address to read.
 * @return {{log: Ref<Array<{moment: number, data: Array<{key: string, name: string, value: string}>, raw: string}>}, isLaoded: Ref<boolean>}}
 *         A reactive object containing the log and a boolean indicating if the log is loaded.
 */
export const useDatalog = (address) => {
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
        data: parseData(item[1].toHuman()),
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
            data: parseData(item.data[2].toHuman()),
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
