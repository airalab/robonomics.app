import { useDevices } from "@/hooks/useDevices";
import { useIpfs } from "@/hooks/useIpfs";
import { useRobonomics } from "@/hooks/useRobonomics";
import { useSend } from "@/hooks/useSend";
import { getLastDatalog } from "@/utils/telemetry";
import { stringToU8a, u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { notify, readFileDecrypt, setStatusLaunch, useSetup } from "./common";

export const useData = () => {
  const cid = ref(null);
  const updateTime = ref(null);
  const data = ref(null);

  const store = useStore();
  const ipfs = useIpfs();
  const { isReady, getInstance, accountManager } = useRobonomics();
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

  let unsubscribeDatalog;
  const watchDatalog = async () => {
    if (!isReady.value) {
      return;
    }
    unsubscribeDatalog = await getInstance().datalog.on(
      { method: "NewRecord" },
      (results) => {
        const r = results.filter((item) => {
          return (
            item.success &&
            controller.value &&
            item.data[0].toHuman() === controller.value
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
    try {
      data.value = await readFileDecrypt(
        cid.value,
        controller.value,
        accountManager.encryptor(),
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
        const datalog = await getLastDatalog(getInstance(), controller.value);
        cid.value = datalog.cid;
        updateTime.value = datalog.timestamp;
        watchDatalog();
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

    if (!devices.devices.value.includes(accountManager.account.address)) {
      notify(store, `Error: You do not have access to device management.`);
      setStatusLaunch(store, command, "error");
      return;
    }

    if (!ipfs.isAuth()) {
      notify(store, `Authorization on ipfs node`);
      try {
        const signature = (
          await accountManager.account.signMsg(
            stringToU8a(accountManager.account.address)
          )
        ).toString();
        ipfs.auth(owner.value, accountManager.account.address, signature);
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

    const encryptor = accountManager.encryptor();
    const controllerPublicKey = decodeAddress(controller.value);

    let commandCid;
    try {
      const cmdString = JSON.stringify(command.launch);
      const cmdCrypto = encryptor.encryptMessage(
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
    const call = getInstance().launch.send(controller.value, commandCid.path);
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
