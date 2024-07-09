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
  const robonomics = useRobonomics();
  const { controller } = useSetup();

  (async () => {
    if (controller.value) {
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
  const robonomics = useRobonomics();
  const { controller } = useSetup();

  const load = async () => {
    notify(store, "Find twin id");

    if (
      !controller.value ||
      !robonomics.accountManager.account ||
      robonomics.accountManager.account.type !== "ed25519"
    ) {
      notify(store, "Error");
      return;
    }

    const datalog = await getLastDatalog(robonomics, controller.value);
    const result = await readFileDecrypt(
      datalog.cid,
      controller.value,
      robonomics.accountManager.encryptor(),
      store,
      ipfs
    );

    if (result) {
      const twin_id = result.twin_id;
      notify(store, `Twin id #${twin_id}`);

      notify(store, `Start load config`);
      const cid = await getConfigCid(robonomics, controller.value, twin_id);
      if (!cid) {
        console.log("Config not found");
        console.log("controller", controller.value);
        console.log("twin_id", twin_id);
      }

      config.value = await readFileDecrypt(
        cid,
        controller.value,
        robonomics.accountManager.encryptor(),
        store,
        ipfs
      );

      localStorage.setItem(
        `haconfig:${controller.value}`,
        JSON.stringify(config.value)
      );

      notify(store, `Config loaded`);
    }
  };

  return { config, load };
};
