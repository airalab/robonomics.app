import configApp from "@/config";
import { createType, TypeRegistry } from "@polkadot/types";
import { validateAddress } from "@polkadot/util-crypto";
import { computed, ref, shallowRef, watch } from "vue";
import { useDevices } from "./useDevices";
import { useRobonomics } from "./useRobonomics";

const getRegistry = () => {
  const registry = new TypeRegistry();
  const types = {
    PalletRobonomicsRwsSubscription: {
      _enum: {
        Lifetime: {
          tps: "Compact<u32>"
        },
        Daily: {
          days: "Compact<u32>"
        }
      }
    },
    PalletRobonomicsRwsSubscriptionLedger: {
      freeWeight: "Compact<u64>",
      issueTime: "Compact<u64>",
      lastUpdate: "Compact<u64>",
      kind: {
        _enum: {
          Lifetime: {
            tps: "Compact<u32>"
          },
          Daily: {
            days: "Compact<u32>"
          }
        }
      }
    }
  };
  registry.register(types);
  return registry;
};

const DAYS_TO_MS = 24 * 60 * 60 * 1000;

export const getLedger = async (robonomics, owner) => {
  const res = await robonomics.rws.getLedger(owner);
  if (!res.isEmpty) {
    return res.value;
  }
  return null;
};

export const getValidUntil = (ledger) => {
  if (!ledger) {
    return null;
  }
  if (ledger.kind.isLifetime) {
    return null;
  }
  const issue_time = ledger.issueTime.toNumber();
  let days = 0;
  if (ledger.kind.isDaily) {
    days = ledger.kind.value.days.toNumber();
  }
  return issue_time + days * DAYS_TO_MS;
};

export const useSubscription = (initialOwner = null) => {
  const owner = ref(initialOwner);
  const dataRaw = shallowRef(null);

  const { isReady, getInstance } = useRobonomics();
  const { devices, loadDevices } = useDevices(owner);

  const getReferenceCallWeight = () => {
    return getInstance().api.consts.rws.referenceCallWeight;
  };

  const getLedger = async (owner) => {
    const endpoint =
      localStorage.getItem("rpc-parachain") || configApp.default_rpc_endpoint;
    const lsKey = `hasubscription:${endpoint}:${owner}`;

    if (!isReady.value) {
      const data = localStorage.getItem(lsKey);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          // if (parsedData.time + DAYS_TO_MS > Date.now()) {
          const res = createType(
            getRegistry(),
            "Option<PalletRobonomicsRwsSubscriptionLedger>",
            parsedData.value
          );
          // console.log("getLedger cache");
          return { data: res.value, cache: true };
          // }
        } catch (error) {
          console.log("hasubscription bad", error);
        }
      } else {
        return { data: undefined, cache: true };
      }
    } else {
      const res = await getInstance().rws.getLedger(owner);
      if (!res.isEmpty) {
        localStorage.setItem(
          lsKey,
          JSON.stringify({ time: Date.now(), value: res.value.toJSON() })
        );
        // console.log("getLedger chain");
        return { data: res.value, cache: false };
      }
    }
    return { data: undefined, cache: false };
  };

  const getFreeWeightCalc = async (owner) => {
    const ledger = (await getLedger(owner)).data;
    if (!ledger) {
      return -1;
    }

    const freeWeight = ledger.freeWeight.toNumber();
    const lastUpdate = ledger.lastUpdate.toNumber();
    const issueTime = ledger.issueTime.toNumber();

    const referenceCallWeight = getReferenceCallWeight();
    const now = Date.now();

    let utps = (() => {
      let tps;
      if (ledger.kind.isLifetime) {
        tps = ledger.kind.value.tps.toNumber();
      } else {
        const days = ledger.kind.value.days.toNumber();
        const duration_ms = days * DAYS_TO_MS;
        if (now < issueTime + duration_ms) {
          tps = 10000;
        } else {
          tps = 0;
        }
      }
      return tps;
    })();

    const delta = now - lastUpdate;
    return Math.floor(
      freeWeight + (referenceCallWeight * utps * delta) / 1000000000
    );
  };

  const validUntil = computed(() => {
    if (!dataRaw.value) {
      return null;
    }
    if (dataRaw.value.kind.isLifetime) {
      return null;
    }
    const issue_time = dataRaw.value.issueTime.toNumber();
    let days = 0;
    if (dataRaw.value.kind.isDaily) {
      days = dataRaw.value.kind.value.days.toNumber();
    }
    return issue_time + days * DAYS_TO_MS;
  });

  const countMonth = computed(() => {
    if (!dataRaw.value) {
      return 0;
    }
    let days = 0;
    if (dataRaw.value.kind.isDaily) {
      days = dataRaw.value.kind.value.days.toNumber();
    }
    return days / 30;
  });

  const isActive = computed(() => {
    if (
      !dataRaw.value ||
      (validUntil.value !== null && Date.now() > validUntil.value)
    ) {
      return false;
    }
    return true;
  });

  const hasSubscription = computed(() => {
    return dataRaw.value;
  });

  const loadLedger = async () => {
    if (owner.value) {
      try {
        validateAddress(owner.value);
        const result = await getLedger(owner.value);
        dataRaw.value = result.data;
        if (result.cache) {
          const stop = watch(
            isReady,
            async () => {
              if (isReady.value) {
                const result = await getLedger(owner.value);
                dataRaw.value = result.data;
                stop();
              }
            },
            { immediate: true }
          );
        }
        return;
        // eslint-disable-next-line no-empty
      } catch (error) {
        console.log(error);
      }
    }
    dataRaw.value = null;
  };

  watch(
    owner,
    async () => {
      await loadLedger();
    },
    {
      immediate: true
    }
  );

  return {
    owner,
    dataRaw,
    hasSubscription,
    isActive,
    countMonth,
    validUntil,
    loadLedger,
    devices,
    loadDevices,
    getFreeWeightCalc
  };
};
