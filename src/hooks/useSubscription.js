import robonomics from "../robonomics";
import { ref, watchEffect, computed } from "vue";

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

export const getFreeWeightCalc = async (owner) => {
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
    let duration_ms = 30 * DAYS_TO_MS;
    if (now < issueTime + duration_ms) {
      return 10000;
    }
    return 0;
  })();

  const delta = now - lastUpdate;
  return Math.floor(
    freeWeight + (referenceCallWeight * utps * delta) / 1000000000
  );
};

export const useSubscription = (owner) => {
  const subscription = ref(null);

  const validUntil = computed(() => {
    if (subscription.value === null) {
      return "";
    }
    const issue_time = subscription.value.issueTime.toNumber();
    let days = 0;
    if (subscription.value.kind.isDaily) {
      days = subscription.value.kind.value.days.toNumber();
    }
    return issue_time + days * DAYS_TO_MS;
  });
  const validUntilFormat = computed(() => {
    if (subscription.value === null) {
      return "-";
    }
    return new Date(validUntil.value).toLocaleDateString();
  });
  const countMonth = computed(() => {
    if (subscription.value === null) {
      return 0;
    }
    let days = 0;
    if (subscription.value.kind.isDaily) {
      days = subscription.value.kind.value.days.toNumber();
    }
    return days / 30;
  });
  const isActive = computed(() => {
    if (subscription.value === null || Date.now() > validUntil.value) {
      return false;
    }
    return true;
  });
  const loadLedger = async (owner) => {
    const ledger = await getLedger(owner);
    if (ledger) {
      subscription.value = ledger;
      return;
    }
    subscription.value = null;
  };
  watchEffect(async () => {
    await loadLedger(owner.value);
  });

  return {
    subscription,
    isActive,
    countMonth,
    validUntil,
    validUntilFormat,
    loadLedger
  };
};
