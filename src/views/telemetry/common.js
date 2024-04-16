import { useIpfs } from "@/hooks/useIpfs";
import { useRobonomics } from "@/hooks/useRobonomics";
import { createPair, encryptor } from "@/utils/encryptor";
import { getConfigCid, getLastDatalog, parseJson } from "@/utils/telemetry";
import { hexToU8a, u8aToString } from "@polkadot/util";
import { ref, watch } from "vue";
import { useStore } from "vuex";

export const chainSS58 = 32;

const catFile = async (store, ipfs, cid) => {
  if (!cid) {
    return false;
  }
  try {
    return await ipfs.catViaGateway(
      store.state.robonomicsUIvue.ipfs.activegateway,
      cid,
      2
    );
  } catch (_) {
    try {
      const res = await ipfs.catViaGateways(
        store.state.robonomicsUIvue.ipfs.gateways,
        cid
      );
      store.commit("ipfs/setActiveGateway", res.gateway);
      return res.result;
    } catch (error) {
      console.log(error.message);
    }
  }
  return false;
};

export const decryptMsgContoller = async (encryptedMsg, controller) => {
  if (encryptedMsg) {
    try {
      const seed = controller.decryptMessage(
        hexToU8a(encryptedMsg[controller.address]),
        controller.pair.publicKey
      );

      const admin = encryptor(createPair(u8aToString(seed)));
      const data = admin.decryptMessage(
        hexToU8a(encryptedMsg.data),
        controller.pair.publicKey
      );
      return parseJson(u8aToString(data));
    } catch (error) {
      console.log(error.message);
    }
  }
  return false;
};

export const catFileController = async (cid, controller, store, ipfs) => {
  if (cid) {
    const data = await catFile(store, ipfs, cid);
    if (!data) {
      console.log(`Error: ${cid} not found in ipfs`);
      return null;
    }
    const result = await decryptMsgContoller(data, controller);
    if (result) {
      return result;
    } else {
      console.log(`Error: decryptMsg`);
    }
  }
  return null;
};

const loadSetup = (store) => {
  if (store.state.robonomicsUIvue.rws.active) {
    const setupRaw = store.state.robonomicsUIvue.rws.list.find(
      (item) => item.owner === store.state.robonomicsUIvue.rws.active
    );
    if (setupRaw) {
      try {
        return {
          controller: encryptor(createPair(setupRaw.scontroller)),
          owner: setupRaw.owner
        };
      } catch (error) {
        console.log(error);
      }
    }
  }
  return false;
};

export const useSetup = () => {
  const controller = ref(null);
  const owner = ref(null);

  const store = useStore();

  watch(
    () => store.state.robonomicsUIvue.rws.active,
    () => {
      const setup = loadSetup(store);
      if (setup) {
        controller.value = setup.controller;
        owner.value = setup.owner;
      }
    },
    { immediate: true }
  );

  return { controller, owner };
};

export const notify = (store, text, timeout = 3000) => {
  store.dispatch("app/setStatus", {
    value: text,
    timeout
  });
  console.log(text);
};

export const setStatusLaunch = (store, command, status) => {
  store.commit(
    "rws/setLaunch",
    JSON.stringify({ ...command, tx: { tx_status: status } })
  );
};

export const useLastDatalog = () => {
  const cid = ref(null);
  const updateTime = ref(null);
  const data = ref(null);

  const store = useStore();
  const ipfs = useIpfs();
  const robonomics = useRobonomics();
  const { controller } = useSetup();

  (async () => {
    if (controller.value) {
      const datalog = await getLastDatalog(
        robonomics,
        controller.value.address
      );
      cid.value = datalog.cid;
      updateTime.value = datalog.timestamp;
      data.value = await catFileController(
        cid.value,
        controller.value,
        store,
        ipfs
      );
    }
  })();

  return { cid, updateTime, data };
};

export const useConfig = () => {
  const config = ref(null);

  const store = useStore();
  const ipfs = useIpfs();
  const robonomics = useRobonomics();
  const { controller } = useSetup();

  (async () => {
    if (controller.value) {
      // const haconfig = localStorage.getItem(
      //   `haconfig:${controller.value.address}`
      // );
      // if (haconfig) {
      //   try {
      //     config.value = JSON.parse(haconfig);
      //   } catch (error) {
      //     console.log(error);
      //   }
      // }
      notify(store, "Find twin id");
      const datalog = await getLastDatalog(
        robonomics,
        controller.value.address
      );
      const result = await catFileController(
        datalog.cid,
        controller.value,
        store,
        ipfs
      );

      if (result) {
        const twin_id = result.twin_id;
        notify(store, `Twin id #${twin_id}`);

        notify(store, `Start load config`);
        const cid = await getConfigCid(
          robonomics,
          controller.value.address,
          twin_id
        );

        config.value = await catFileController(
          cid,
          controller.value,
          store,
          ipfs
        );

        localStorage.setItem(
          `haconfig:${controller.value.address}`,
          JSON.stringify(config.value)
        );

        notify(store, `Config loaded`);
      } else {
        notify(store, "Error: not found twin id");
      }
    }
  })();

  return { config };
};
