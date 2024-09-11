import { inject } from "vue";

export function useRobonomics() {
  const provider = inject("RobonomicsProvider");
  return {
    accountManager: provider.accountManager,
    isReady: provider.isReady,
    robonomics: provider.instance,
    getInstance: () => provider.instance.value
  };
}
