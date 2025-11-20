import {
  connectMultiaddress,
  disconnect,
  request,
  start
} from "@/utils/libp2p/libp2p";
import { u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { useAccount } from "robonomics-interface-vue/account";
import { useDevices } from "robonomics-interface-vue/devices";
import { onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { useAccounts } from "../../hooks/useAccounts";
import { decryptData, notify, setStatusLaunch, useSetup } from "./common";

export const useData = () => {
  const data = ref(null);
  const updateTime = ref(null);

  const store = useStore();
  const { encryptor } = useAccounts();
  const { account } = useAccount();
  const subscriptionOwner = ref();
  const { data: dataDevices } = useDevices(subscriptionOwner, {
    immediate: false
  });
  const { controller } = useSetup();

  watch(
    () => store.state.robonomicsUIvue.rws.active,
    () => {
      subscriptionOwner.value = store.state.robonomicsUIvue.rws.active;
    },
    { immediate: true }
  );

  onUnmounted(() => {
    disconnect();
  });

  const run = async (peer_id, peer_multiaddress) => {
    const node = await start();
    try {
      notify(store, `Connect to peer id ${peer_id}`);
      const connected = await connectMultiaddress(peer_id, peer_multiaddress);
      if (connected) {
        notify(store, `Connected`);
        const protocols = node.getProtocols();
        if (protocols.includes("/update")) {
          await node.unhandle("/update");
        }
        node.services.ha.handle("/update", async (dataRaw, stream) => {
          const result = await decryptData(
            dataRaw.data,
            controller.value,
            encryptor()
          );
          if (result) {
            data.value = result;
            updateTime.value = Date.now();
            await node.services.ha.utils.sendResponse(stream, {
              result: true
            });
          } else {
            notify(store, `Error: decryptMsg`);
          }
        });
        return connected;
      }
    } catch (error) {
      notify(store, `Error: ${error.message}`);
      console.log(error);
    }
    return false;
  };

  const launch = async (command) => {
    console.log(command.launch.params.entity_id, command.tx.tx_status);
    if (command.tx.tx_status !== "pending") {
      return;
    }

    notify(store, `Launch command`);

    if (!dataDevices.value.includes(account.value)) {
      notify(store, `Error: You do not have access to device management.`);
      setStatusLaunch(store, command, "error");
      return;
    }

    try {
      const encryptor = encryptor();
      const controllerPublicKey = decodeAddress(controller.value);
      const cmdString = JSON.stringify(command.launch);
      const cmdCrypto = encryptor.encryptMessage(
        cmdString,
        controllerPublicKey
      );
      const response = await request({
        data: {
          sender: account.value,
          data: u8aToHex(cmdCrypto)
        }
      });
      console.log(`response:`, response);

      setStatusLaunch(store, command, "success");
    } catch (error) {
      console.log(error);
      notify(store, `Error: Check status of the HomeAssistant.`);
      setStatusLaunch(store, command, "error");
    }
  };

  return { data, updateTime, run, launch };
};
