import { validateAddress } from "@polkadot/util-crypto";
import { onUnmounted, ref, watch } from "vue";
import { useRobonomics } from "./useRobonomics";

export const useDevices = (initialOwner = null) => {
  const robonomics = useRobonomics();
  const owner = ref(initialOwner);
  const devices = ref([]);

  const loadDevices = async () => {
    if (owner.value) {
      try {
        validateAddress(owner.value);
        const result = await robonomics.rws.getDevices(owner.value);
        devices.value = result.map((item) => {
          return item.toHuman();
        });
        return;
      } catch (error) {
        console.log(error);
      }
    }
    devices.value = [];
  };
  watch(
    owner,
    async () => {
      await loadDevices();
    },
    {
      immediate: true
    }
  );

  (async () => {
    const unsubscribe = await robonomics.events.on(
      { section: "rws", method: "NewDevices" },
      async (result) => {
        for (const event of result) {
          if (event.data[0].toHuman() === owner.value) {
            await loadDevices();
          }
        }
      }
    );
    onUnmounted(unsubscribe);
  })();

  return {
    owner,
    devices,
    loadDevices
  };
};
