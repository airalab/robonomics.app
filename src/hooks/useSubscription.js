import { validateAddress } from "@polkadot/util-crypto";
import { computed, reactive, ref, toRaw, watch } from "vue";
import { useDevices } from "./useDevices";
import { useRobonomics } from "./useRobonomics";

export const useSubscription = (initialOwner = null) => {
  const owner = ref(initialOwner);
  const dataRaw = reactive({ value: null });

  const robonomics = useRobonomics();
  const { devices, loadDevices } = useDevices(owner);

  const getReferenceCallWeight = () => {
    return robonomics.api.consts.rws.referenceCallWeight;
  };

  const getLedger = async (owner) => {
    const res = await robonomics.rws.getLedger(owner);
    if (!res.isEmpty) {
      return res.value;
    }
    return;
  };

  const DAYS_TO_MS = 24 * 60 * 60 * 1000;

  const getFreeWeightCalc = async (owner) => {
    const ledger = await getLedger(owner);
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
    if (dataRaw.value === null) {
      return "";
    }
    const dataRawObject = toRaw(dataRaw);
    if (dataRawObject.value.kind.isLifetime) {
      return null;
    }
    const issue_time = dataRawObject.value.issueTime.toNumber();
    let days = 0;
    if (dataRawObject.value.kind.isDaily) {
      days = dataRawObject.value.kind.value.days.toNumber();
    }
    return issue_time + days * DAYS_TO_MS;
  });

  const countMonth = computed(() => {
    if (dataRaw.value === null) {
      return 0;
    }
    const dataRawObject = toRaw(dataRaw);
    let days = 0;
    if (dataRawObject.value.kind.isDaily) {
      days = dataRawObject.value.kind.value.days.toNumber();
    }
    return days / 30;
  });

  const isActive = computed(() => {
    if (
      dataRaw.value === null ||
      (validUntil.value !== null && Date.now() > validUntil.value)
    ) {
      return false;
    }
    return true;
  });

  const hasSubscription = computed(() => {
    return dataRaw.value !== null;
  });

  const loadLedger = async () => {
    if (owner.value) {
      try {
        validateAddress(owner.value);
        const ledger = await getLedger(owner.value);
        if (ledger) {
          dataRaw.value = ledger;
          return;
        }
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
