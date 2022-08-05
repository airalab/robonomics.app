import robonomics from "../robonomics";
import { ref, watchEffect } from "vue";
import Storage from "../utils/storage";

export const storage = new Storage("rws-devices");

export const useDevices = (owner) => {
  const devices = ref([]);

  const loadDevices = async (owner) => {
    const devicesStore = storage.getItems()[owner] || [];
    const result = await robonomics.rws.getDevices(owner);
    devices.value = result.map((item) => {
      const device = devicesStore.find(
        (device) => device.address === item.toHuman()
      );
      return {
        name: device ? device.name : "",
        address: item.toHuman()
      };
    });
  };
  watchEffect(async () => {
    await loadDevices(owner.value);
  });

  return {
    devices,
    loadDevices
  };
};
