import { validateAddress } from "@polkadot/util-crypto";
import { ref, watch } from "vue";
import robonomics from "../robonomics";
import Storage from "../utils/storage";

export const storage = new Storage("rws-devices");

export const useDevices = (initialOwner = null) => {
  const owner = ref(initialOwner);
  const devices = ref([]);

  const loadDevices = async () => {
    if (owner.value) {
      try {
        validateAddress(owner.value);
        const devicesStore = storage.getItems()[owner.value] || [];
        const result = await robonomics.rws.getDevices(owner.value);
        devices.value = result.map((item) => {
          const device = devicesStore.find(
            (device) => device.address === item.toHuman()
          );
          return {
            name: device ? device.name : "",
            address: item.toHuman()
          };
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

  return {
    owner,
    devices,
    loadDevices
  };
};
