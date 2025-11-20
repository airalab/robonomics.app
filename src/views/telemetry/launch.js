import { useIpfs } from "@/hooks/useIpfs";
import { cidToHex } from "@/utils/string";
import { getLastDatalog } from "@/utils/telemetry";
import { stringToU8a, u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { usePolkadotApi } from "robonomics-interface-vue";
import { useAccount, useSend } from "robonomics-interface-vue/account";
import { useQuery } from "robonomics-interface-vue/datalog";
import { useDevices } from "robonomics-interface-vue/devices";
import { useAction } from "robonomics-interface-vue/launch";
import { onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { useAccounts } from "../../hooks/useAccounts";
import { notify, readFileDecrypt, setStatusLaunch, useSetup } from "./common";

export const useData = () => {
  const cid = ref(null);
  const updateTime = ref(null);
  const data = ref(null);

  const store = useStore();
  const ipfs = useIpfs();
  const {
    isConnected: isReady,
    instance: robonomics,
    watchConnect
  } = usePolkadotApi();
  const { encryptor, signMsg } = useAccounts();
  const { pair, account } = useAccount();
  const { tx } = useSend();
  const action = useAction();
  const subscriptionOwner = ref();
  const { data: devices } = useDevices(subscriptionOwner, {
    immediate: false
  });
  const { controller, owner } = useSetup();
  const { listen } = useQuery();

  watch(
    () => store.state.robonomicsUIvue.rws.active,
    () => {
      subscriptionOwner.value = store.state.robonomicsUIvue.rws.active;
    },
    { immediate: true }
  );

  let unsubscribeDatalog;
  watchConnect(async () => {
    unsubscribeDatalog = await listen(
      {
        method: "NewRecord",
        sender: controller.value
      },
      (r) => {
        updateTime.value = r.data[0];
        cid.value = r.data[1];
      }
    );
  });

  onUnmounted(() => {
    console.log("unmount launch");
    if (unsubscribeDatalog) {
      unsubscribeDatalog();
    }
  });

  watch(cid, async () => {
    try {
      data.value = await readFileDecrypt(
        cid.value,
        controller.value,
        encryptor(),
        store
      );
    } catch (error) {
      console.log(error);
      notify(store, error.message);
    }
  });

  const run = async () => {
    if (controller.value) {
      if (isReady.value) {
        const datalog = await getLastDatalog(robonomics.api, controller.value);
        cid.value = datalog.cid;
        updateTime.value = datalog.timestamp;
      } else {
        const stop = watch(isReady, (isReady) => {
          if (isReady) {
            run();
            stop();
          }
        });
      }
    }
  };

  const launch = async (command) => {
    console.log(command.launch.params.entity_id, command.tx.tx_status);
    if (command.tx.tx_status !== "pending") {
      return;
    }

    notify(store, `Launch command`);
    console.log(`command ${JSON.stringify(command)}`);

    if (!devices.value || !devices.value.includes(account.value)) {
      notify(store, `Error: You do not have access to device management.`);
      setStatusLaunch(store, command, "error");
      return;
    }

    if (!ipfs.isAuth()) {
      notify(store, `Authorization on ipfs node`);
      try {
        const signature = signMsg(stringToU8a(pair.value.address));
        ipfs.auth(owner.value, account.value, signature);
      } catch (error) {
        if (error.message === "Cancelled") {
          setStatusLaunch(store, command, "declined");
        } else {
          console.log(error);
          setStatusLaunch(store, command, "error");
        }
        return;
      }
      setStatusLaunch(store, command, "approved");
    }

    const encryptorObject = encryptor();
    const controllerPublicKey = decodeAddress(controller.value);

    let commandCid;
    try {
      const cmdString = JSON.stringify(command.launch);
      const cmdCrypto = encryptorObject.encryptMessage(
        cmdString,
        controllerPublicKey
      );
      commandCid = await ipfs.add(u8aToHex(cmdCrypto));
    } catch (error) {
      setStatusLaunch(store, command, "error");
      notify(store, `Error: ${error.message}`);
      return;
    }
    console.log(`launch ipfs file ${commandCid.path}`);

    if (!isReady.value) {
      notify(store, `Error: Robonomics is not ready.`);
      setStatusLaunch(store, command, "error");
      return;
    }

    notify(store, `Send launch`);
    await tx.send(
      () => action.launch(controller.value, cidToHex(commandCid.path)),
      {
        subscription: owner.value
      }
    );
    if (tx.error.value) {
      if (tx.error.value !== "Cancelled") {
        setStatusLaunch(store, command, "error");
        notify(store, `Error: ${tx.error.value}`);
      } else {
        setStatusLaunch(store, command, "declined");
        notify(store, "Calcel");
      }
    } else {
      console.log(command);
      setStatusLaunch(store, command, "success");
      notify(store, "Launch sended");
    }
  };

  return { cid, updateTime, data, run, stop, launch };
};
