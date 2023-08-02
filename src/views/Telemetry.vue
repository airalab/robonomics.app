<template>
  <robo-template-devices-layout
    :datalog="datalog"
    :config="config"
    :updateTime="updateTime"
  />
</template>

<script>
import { useIpfs } from "@/hooks/useIpfs";
import { useRobonomics } from "@/hooks/useRobonomics";
import { useSend } from "@/hooks/useSend";
import {
  decryptMsg,
  getConfigCid,
  getLastDatalog,
  parseJson
} from "@/utils/telemetry";
import { Keyring } from "@polkadot/keyring";
import { stringToU8a } from "@polkadot/util";
import { onUnmounted, reactive, ref, watch, watchEffect } from "vue";
import { useStore } from "vuex";

export default {
  setup() {
    const datalog = ref(null);
    const config = ref(null);
    const datalogCid = ref("");
    const configCid = ref("");
    const updateTime = ref(null);
    const setup = reactive({ controller: null, admin: null });

    const robonomics = useRobonomics();
    const store = useStore();
    const ipfs = useIpfs();
    const tx = useSend();

    const notify = (text) => {
      store.dispatch("app/setStatus", {
        value: text,
        timeout: 3000
      });
      console.log(text);
    };
    const logger = (data, ...props) => {
      console.log(data);
      if (props.length) {
        console.log(props);
      }
    };

    let unsubscribeDatalog;
    const watchDatalog = async () => {
      unsubscribeDatalog = await robonomics.datalog.on(
        { method: "NewRecord" },
        (results) => {
          const r = results.filter((item) => {
            return (
              item.success &&
              item.data[0].toHuman() === setup.controller.address
            );
          });
          for (const item of r) {
            console.log(item.data[1].toString(), item.data[2].toHuman());
            updateTime.value = item.data[1].toNumber();
            datalogCid.value = item.data[2].toHuman();
          }
        }
      );
    };

    onUnmounted(() => {
      if (unsubscribeDatalog) {
        unsubscribeDatalog();
      }
    });

    const keyring = new Keyring({
      ss58Format: robonomics.api?.registry.chainSS58
    });

    const catFileContoller = async (controller, cid) => {
      if (!cid) {
        return false;
      }
      try {
        const result = await ipfs.catViaGateway(
          store.state.robonomicsUIvue.ipfs.activegateway,
          cid
        );
        const seed = decryptMsg(
          result[controller.address],
          controller.publicKey,
          controller
        );
        const admin = keyring.addFromUri(seed, {}, "ed25519");
        const data = decryptMsg(result.data, controller.publicKey, admin);
        return parseJson(data);
      } catch (error) {
        console.log(error.message);
        return false;
      }
    };

    const loadSetup = () => {
      if (!store.state.robonomicsUIvue.rws.active) {
        return;
      }
      notify(`Load setup`);
      logger({ owner: store.state.robonomicsUIvue.rws.active });
      const setupRaw = store.state.robonomicsUIvue.rws.list.find(
        (item) => item.owner === store.state.robonomicsUIvue.rws.active
      );
      if (setupRaw) {
        try {
          setup.controller = keyring.addFromUri(
            setupRaw.scontroller,
            {},
            "ed25519"
          );
          setup.admin = setupRaw.owner;
          return;
        } catch (error) {
          console.log(error);
        }
      }
      setup.controller = null;
      setup.admin = null;
    };

    const findTelemetryCid = async () => {
      if (!setup.controller) {
        notify("Error: Not found controller");
        return;
      }
      notify(`Telemetry search`);
      logger(`findTelemetryCid start`);
      try {
        configCid.value = "";
        datalogCid.value = "";
        const datalog = await getLastDatalog(
          robonomics,
          setup.controller.address
        );
        updateTime.value = datalog.timestamp;
        datalogCid.value = datalog.cid;
      } catch (error) {
        console.log(error);
      }
      logger("findTelemetryCid end");
    };

    watch(
      () => store.state.robonomicsUIvue.rws.active,
      () => {
        loadSetup();
      },
      { immediate: true }
    );

    watchEffect(() => {
      if (unsubscribeDatalog) {
        unsubscribeDatalog();
      }
      if (setup.controller) {
        findTelemetryCid();
        watchDatalog();
      } else {
        configCid.value = "";
        datalogCid.value = "";
      }
    });

    watch(datalogCid, async () => {
      notify("Load datalog");
      logger("load datalog start");
      logger({ controller: setup.controller.address, cid: datalogCid.value });
      if (datalogCid.value) {
        const result = await catFileContoller(
          setup.controller,
          datalogCid.value
        );
        if (result) {
          datalog.value = result;
          notify("Datalog loaded");
          logger(JSON.stringify(datalog.value));

          if (!configCid.value) {
            logger(`twin id ${result.twin_id}`);
            configCid.value = await getConfigCid(
              robonomics,
              setup.controller.address,
              result.twin_id
            );
          }
        } else {
          notify("Error: datalog not found in ipfs");
        }
      } else {
        datalog.value = null;
      }
      logger("load datalog end");
    });

    watch(configCid, async () => {
      notify("Load config");
      logger("load config start");
      logger({ controller: setup.controller.address, cid: configCid.value });
      if (configCid.value) {
        const result = await catFileContoller(
          setup.controller,
          configCid.value
        );
        if (result) {
          config.value = result;
          notify("Config loaded");
          logger(JSON.stringify(config.value));
        } else {
          notify("Error: config not found in ipfs");
        }
      } else {
        config.value = null;
      }
      logger("load config end");
    });

    const setStatusLaunch = (command, status) => {
      store.commit(
        "rws/setLaunch",
        JSON.stringify({ ...command, tx: { tx_status: status } })
      );
    };
    const launch = async (command) => {
      if (command.tx.tx_status !== "pending") {
        return;
      }

      notify(`Launch command`);
      logger(`command ${JSON.stringify(command)}`);

      if (!ipfs.isAuth()) {
        notify(`Authorization on ipfs node`);
        try {
          const signature = (
            await robonomics.accountManager.account.signMsg(
              stringToU8a(robonomics.accountManager.account.address)
            )
          ).toString();
          ipfs.auth(
            setup.admin,
            robonomics.accountManager.account.address,
            signature
          );
        } catch (error) {
          if (error.message === "Cancelled") {
            setStatusLaunch(command, "declined");
          } else {
            logger(error);
            setStatusLaunch(command, "error");
          }
          return;
        }
        setStatusLaunch(command, "approved");
      }

      let cid;
      try {
        cid = await ipfs.add(JSON.stringify(command.launch));
      } catch (error) {
        setStatusLaunch(command, "error");
        notify(`Error: ${error.message}`);
        return;
      }
      logger(`launch ipfs file ${cid.path}`);

      notify(`Send launch`);
      const call = robonomics.launch.send(setup.controller.address, cid.path);
      await tx.send(call, setup.admin);
      if (tx.error.value) {
        if (tx.error.value !== "Cancelled") {
          setStatusLaunch(command, "error");
          notify(`Error: ${tx.error.value}`);
        } else {
          setStatusLaunch(command, "declined");
          notify("Calcel");
        }
      } else {
        setStatusLaunch(command, "success");
        notify("Launch sended");
      }
    };

    watch(
      () => store.state.robonomicsUIvue.rws.launch,
      (value) => {
        try {
          launch(JSON.parse(value));
        } catch (error) {
          console.log(error);
        }
      }
    );

    return { datalog, config, updateTime, configCid, launch, tx };
  }
};
</script>
