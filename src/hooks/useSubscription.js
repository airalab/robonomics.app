import robonomics from "../robonomics";
import { ref, watchEffect, computed } from "vue";

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
    return issue_time + days * (24 * 60 * 60 * 1000);
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
    const res = await robonomics.rws.getLedger(owner);
    if (!res.isEmpty) {
      subscription.value = res.value;
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
