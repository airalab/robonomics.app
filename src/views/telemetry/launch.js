import { useDevices } from "@/hooks/useDevices";
import { useIpfs } from "@/hooks/useIpfs";
import { useRobonomics } from "@/hooks/useRobonomics";
import { useSend } from "@/hooks/useSend";
import { getLastDatalog } from "@/utils/telemetry";
import { Keyring } from "@polkadot/keyring";
import { stringToU8a } from "@polkadot/util";
import { onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import {
  catFileController,
  chainSS58,
  notify,
  setStatusLaunch,
  useSetup
} from "./common";

export const useData = () => {
  const cid = ref(null);
  const updateTime = ref(null);
  const data = ref(null);

  const store = useStore();
  const ipfs = useIpfs();
  const robonomics = useRobonomics();
  const transaction = useSend();
  const devices = useDevices();
  const { controller, owner } = useSetup();

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

  let unsubscribeDatalog;
  const watchDatalog = async () => {
    unsubscribeDatalog = await robonomics.datalog.on(
      { method: "NewRecord" },
      (results) => {
        const r = results.filter((item) => {
          return (
            item.success && item.data[0].toHuman() === controller.value.address
          );
        });
        for (const item of r) {
          updateTime.value = item.data[1].toNumber();
          cid.value = item.data[2].toHuman();
        }
      }
    );
  };

  watch(cid, async () => {
    data.value = await catFileController(
      cid.value,
      controller.value,
      store,
      ipfs,
      keyring
    );
  });

  const run = async () => {
    const datalog = await getLastDatalog(robonomics, controller.value.address);
    cid.value = datalog.cid;
    updateTime.value = datalog.timestamp;
    watchDatalog();
  };

  const stop = () => {
    if (unsubscribeDatalog) {
      unsubscribeDatalog();
    }
  };

  onUnmounted(() => {
    console.log("unmount launch");
    stop();
  });

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

    if (!ipfs.isAuth()) {
      notify(store, `Authorization on ipfs node`);
      try {
        const signature = (
          await robonomics.accountManager.account.signMsg(
            stringToU8a(robonomics.accountManager.account.address)
          )
        ).toString();
        ipfs.auth(
          owner.value,
          robonomics.accountManager.account.address,
          signature
        );
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

    let commandCid;
    try {
      commandCid = await ipfs.add(JSON.stringify(command.launch));
    } catch (error) {
      setStatusLaunch(store, command, "error");
      notify(store, `Error: ${error.message}`);
      return;
    }
    console.log(`launch ipfs file ${commandCid.path}`);

    notify(store, `Send launch`);
    const call = robonomics.launch.send(
      controller.value.address,
      commandCid.path
    );
    const tx = transaction.createTx();
    await transaction.send(tx, call, owner.value);
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
