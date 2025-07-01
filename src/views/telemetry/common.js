import configApp from "@/config";
import { useRobonomics } from "@/hooks/useRobonomics";
import { createPair, encryptor } from "@/utils/encryptor";
import { getConfigCid, getLastDatalog, parseJson } from "@/utils/telemetry";
import { hexToU8a, u8aToString } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import axios from "axios";
import { ref, watch } from "vue";
import { useStore } from "vuex";

export const chainSS58 = 32;

const watchIpfsGateway = async (store) => {
  return new Promise((resolve) => {
    if (store.state.robonomicsUIvue.ipfs.activeGateway) {
      resolve(store.state.robonomicsUIvue.ipfs.activeGateway);
      return;
    }
    let stop;
    stop = watch(
      () => store.state.robonomicsUIvue.ipfs.activeGateway,
      async (activeGateway) => {
        if (activeGateway) {
          resolve(activeGateway);
          if (stop) {
            stop();
          }
        }
      },
      { immediate: true }
    );
  });
};

const catFile = async (store, cid) => {
  if (!cid) {
    return false;
  }
  try {
    const activeGateway = await watchIpfsGateway(store);
    const res = (await axios.get(`${activeGateway}/ipfs/${cid}`)).data;
    return res;
  } catch (error) {
    console.log(error);
    throw new Error("File not available");
  }
};

export const decryptData = async (encryptedMsg, controller, account) => {
  if (encryptedMsg) {
    try {
      const controllerPublicKey = decodeAddress(controller);
      const seed = account.decryptMessage(
        hexToU8a(encryptedMsg[account.address]),
        controllerPublicKey
      );
      const admin = encryptor(createPair(u8aToString(seed)));
      const data = admin.decryptMessage(
        hexToU8a(encryptedMsg.data),
        controllerPublicKey
      );
      return parseJson(u8aToString(data));
    } catch (error) {
      console.log(error.message);
    }
  }
  return false;
};

export const readFileDecrypt = async (cid, controller, account, store) => {
  if (cid) {
    const data = await catFile(store, cid);
    if (!data) {
      console.log(`Error: ${cid} not found in ipfs`);
      throw new Error(`${cid} not found in ipfs`);
    }
    const result = await decryptData(data, controller, account);
    if (result) {
      return result;
    } else {
      console.log(`Error: decryptMsg`);
      throw new Error(`decryptMsg`);
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
          controller: setupRaw.controller.address,
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
  // console.log(text);
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
  const { isReady, getInstance } = useRobonomics();
  const { controller } = useSetup();

  (async () => {
    if (isReady.value && controller.value) {
      const robonomics = getInstance();
      const datalog = await getLastDatalog(robonomics, controller.value);
      cid.value = datalog.cid;
      updateTime.value = datalog.timestamp;
      try {
        data.value = await readFileDecrypt(
          cid.value,
          controller.value,
          robonomics.accountManager.encryptor(),
          store
        );
      } catch (error) {
        console.log(error);
        notify(store, error.message);
      }
    }
  })();

  return { cid, updateTime, data };
};

export const useConfig = () => {
  const config = ref(null);
  const cid = ref("");

  const store = useStore();
  const { isReady, getInstance, accountManager } = useRobonomics();
  const { controller } = useSetup();

  const getConfig = async (controller) => {
    const endpoint =
      localStorage.getItem("rpc-parachain") || configApp.default_rpc_endpoint;
    const lsKey = `haconfig:${endpoint}:${controller}`;

    if (!isReady.value) {
      const data = localStorage.getItem(lsKey);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          console.log("getConfig cache");
          return { data: parsedData.value, cache: true };
        } catch (error) {
          console.log("haconfig bad", error);
        }
      } else {
        return { data: null, cache: true };
      }
    } else {
      const robonomics = getInstance();

      const datalog = await getLastDatalog(robonomics, controller);
      cid.value = datalog.cid;
      const result = await readFileDecrypt(
        datalog.cid,
        controller,
        accountManager.encryptor(),
        store
      );

      if (result) {
        const twin_id = result.twin_id;
        notify(store, `Twin id #${twin_id}`);

        notify(store, `Start load config`);
        const cid = await getConfigCid(robonomics, controller, twin_id);
        if (!cid) {
          console.log("Config not found");
          console.log("controller", controller);
          console.log("twin_id", twin_id);
        }

        const config = await readFileDecrypt(
          cid,
          controller,
          accountManager.encryptor(),
          store
        );

        localStorage.setItem(
          lsKey,
          JSON.stringify({ time: Date.now(), value: config })
        );
        console.log("getConfig chain");

        return { data: config, cache: false };
      }
    }
    return { data: null, cache: false };
  };

  const load = async () => {
    notify(store, "Find twin id");

    if (
      !controller.value ||
      !accountManager.account ||
      accountManager.account.type !== "ed25519"
    ) {
      notify(store, "Error");
      return;
    }

    let result;
    try {
      result = await getConfig(controller.value);
    } catch (error) {
      console.log(error);
      notify(store, "Error: " + error.message);
      return;
    }

    config.value = result.data;
    if (result.cache) {
      const stop = watch(
        isReady,
        async () => {
          if (isReady.value) {
            try {
              const result = await getConfig(controller.value);
              config.value = result.data;
              stop();
            } catch (error) {
              console.log(error);
              notify(store, "Error: " + error.message);
            }
          }
        },
        { immediate: true }
      );
    }

    if (config.value !== null) {
      notify(store, `Config loaded`);
    }
  };

  return { config, cid, load };
};
