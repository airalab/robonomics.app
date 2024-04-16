import { useDevices } from "@/hooks/useDevices";
import { useRobonomics } from "@/hooks/useRobonomics";
import {
  connect,
  disconnect,
  getUriPeer,
  request,
  start
} from "@/utils/libp2p/libp2p";
import { Keyring } from "@polkadot/keyring";
import { u8aToHex } from "@polkadot/util";
import { onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import {
  chainSS58,
  decryptMsgContoller,
  notify,
  setStatusLaunch,
  useSetup
} from "./common";

export const useData = () => {
  const data = ref(null);
  const updateTime = ref(null);

  const store = useStore();
  const robonomics = useRobonomics();
  const devices = useDevices();
  const { controller } = useSetup();

  watch(
    () => store.state.robonomicsUIvue.rws.active,
    () => {
      devices.owner.value = store.state.robonomicsUIvue.rws.active;
    },
    { immediate: true }
  );

  const keyring = new Keyring({
    ss58Format: chainSS58
  });

  onUnmounted(() => {
    disconnect();
  });

  const run = async (peer_id, peer_address) => {
    const node = await start();
    try {
      notify(store, `Connect to peer id ${peer_id}`);
      const uriPeer = await getUriPeer(peer_id, peer_address);
      await connect(uriPeer);
      notify(store, `Connected`);
      const protocols = node.getProtocols();
      if (protocols.includes("/update")) {
        await node.unhandle("/update");
      }
      node.services.ha.handle("/update", async (dataRaw, stream) => {
        const result = await decryptMsgContoller(
          dataRaw.data,
          controller.value,
          keyring
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
      return true;
    } catch (error) {
      notify(store, `Error: ${error.message}`);
      console.log(error);
    }
    return false;
  };

  const setAccountController = async () => {
    const pair = robonomics.accountManager.keyring.keyring.addFromPair(
      controller.value.pair
    );
    await robonomics.accountManager.setSender(pair.address, {
      type: pair.type,
      extension: null
    });
  };
  const setAccountFromHeader = async () => {
    const accountOld = store.state.robonomicsUIvue.polkadot.accounts.find(
      (item) => item.address === store.state.robonomicsUIvue.polkadot.address
    );
    await robonomics.accountManager.setSender(accountOld.address, {
      type: accountOld.type,
      extension: store.state.robonomicsUIvue.polkadot.extensionObj
    });
  };

  const launch = async (command) => {
    console.log(command.launch.params.entity_id, command.tx.tx_status);
    if (command.tx.tx_status !== "pending") {
      return;
    }

    notify(store, `Launch command`);

    await setAccountController();

    if (
      robonomics.accountManager.account.address !==
        store.state.robonomicsUIvue.rws.active &&
      !devices.devices.value.includes(robonomics.accountManager.account.address)
    ) {
      notify(store, `Error: You do not have access to device management.`);
      setStatusLaunch(store, command, "error");
      await setAccountFromHeader();
      return;
    }

    try {
      const cmdString = JSON.stringify(command.launch);
      const cmdCrypto = controller.value.encryptMessage(
        cmdString,
        controller.value.pair.publicKey
      );

      const response = await request({ data: u8aToHex(cmdCrypto) });
      console.log(`response:`, response);

      setStatusLaunch(store, command, "success");
    } catch (error) {
      console.log(error);
      notify(store, `Error: Check status of the HomeAssistant.`);
      setStatusLaunch(store, command, "error");
    }
    await setAccountFromHeader();
  };

  return { data, updateTime, run, launch };
};
