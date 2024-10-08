import { useIpfs } from "@/hooks/useIpfs";
import { useRobonomics } from "@/hooks/useRobonomics";
import { createPair, encryptor } from "@/utils/encryptor";
import { getConfigCid, getLastDatalog, parseJson } from "@/utils/telemetry";
import { hexToU8a, u8aToString } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { ref, watch } from "vue";
import { useStore } from "vuex";

export const chainSS58 = 32;

const catFile = async (store, ipfs, cid) => {
  if (!cid) {
    return false;
  }
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
  return false;
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

export const readFileDecrypt = async (
  cid,
  controller,
  account,
  store,
  ipfs
) => {
  if (cid) {
    const data = await catFile(store, ipfs, cid);
    if (!data) {
      console.log(`Error: ${cid} not found in ipfs`);
      return null;
    }
    const result = await decryptData(data, controller, account);
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
          controller: setupRaw.controller,
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
  const { isReady, getInstance } = useRobonomics();
  const { controller } = useSetup();

  (async () => {
    if (isReady.value && controller.value) {
      const robonomics = getInstance();
      const datalog = await getLastDatalog(robonomics, controller.value);
      cid.value = datalog.cid;
      updateTime.value = datalog.timestamp;
      data.value = await readFileDecrypt(
        cid.value,
        controller.value,
        robonomics.accountManager.encryptor(),
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
  const { isReady, getInstance, accountManager } = useRobonomics();
  const { controller } = useSetup();

  const getConfig = async (controller) => {
    const endpoint =
      localStorage.getItem("rpc-parachain") ||
      "wss://kusama.rpc.robonomics.network/";
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
      const result = await readFileDecrypt(
        datalog.cid,
        controller,
        accountManager.encryptor(),
        store,
        ipfs
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
          store,
          ipfs
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

    const result = await getConfig(controller.value);
    config.value = result.data;
    if (result.cache) {
      const stop = watch(
        isReady,
        async () => {
          if (isReady.value) {
            const result = await getConfig(controller.value);
            config.value = result.data;
            stop();
          }
        },
        { immediate: true }
      );
    }

    if (config.value !== null) {
      notify(store, `Config loaded`);
    }
  };

  return { config, load };
};
