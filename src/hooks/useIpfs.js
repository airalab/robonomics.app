import { useAccount } from "@/hooks/useAccount";
import { inject, watch } from "vue";

export function useIpfs() {
  const { account } = useAccount();
  const { instance } = inject("IpfsProvider");

  watch(account, async () => {
    if (instance.value) {
      instance.value.authClear();
    }
  });

  return instance.value;
}
