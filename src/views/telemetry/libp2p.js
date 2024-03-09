import { useDevices } from "@/hooks/useDevices";
import { useRobonomics } from "@/hooks/useRobonomics";
import { connect, request, start } from "@/utils/libp2p/libp2p";
import { Keyring } from "@polkadot/keyring";
import { ref, watch } from "vue";
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

  const run = async (peer_id) => {
    const node = await start();
    try {
      notify(store, `Connect to peer id ${peer_id}`);
      await connect(
        `/dns4/libp2p-relay.robonomics.network/tcp/443/wss/p2p/12D3KooWEmZfGh3HEy7rQPKZ8DpJRYfFcbULN97t3hGwkB5xPmjn/p2p-circuit/p2p/${peer_id}`
        // `/dns4/vol4.work.gd/tcp/443/wss/p2p/12D3KooWEmZfGh3HEy7rQPKZ8DpJRYfFcbULN97t3hGwkB5xPmjn/p2p-circuit/p2p/${result.peer_id}`
      );
      notify(store, `Connected`);
      node.services.ha.handle("/update", async (dataRow, stream) => {
        const result = await decryptMsgContoller(
          JSON.parse(dataRow),
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

  const launch = async (command) => {
    console.log(command.launch.params.entity_id, command.tx.tx_status);
    if (command.tx.tx_status !== "pending") {
      return;
    }

    notify(store, `Launch command`);
    console.log(`command ${JSON.stringify(command)}`);

    if (
      robonomics.accountManager.account.address !==
        store.state.robonomicsUIvue.rws.active &&
      !devices.devices.value.includes(robonomics.accountManager.account.address)
    ) {
      notify(store, `Error: You do not have access to device management.`);
      setStatusLaunch(store, command, "error");
      return;
    }

    const response = await request(command.launch);
    console.log(`response: ${response}`);

    setStatusLaunch(store, command, "success");
  };

  return { data, updateTime, run, launch };
};
