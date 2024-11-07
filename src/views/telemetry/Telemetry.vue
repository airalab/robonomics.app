<template>
  <Libp2p
    v-if="type === 'libp2p'"
    :config="config"
    :isKey
    @connected="handlerConnected"
    @error="handlerError"
  />
  <Launch v-else :config="config" :isKey />
</template>

<script>
import { useRobonomics } from "@/hooks/useRobonomics";
import { onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import Launch from "./Launch.vue";
import Libp2p from "./Libp2p.vue";
import { useConfig } from "./common";

export default {
  components: { Libp2p, Launch },
  setup() {
    const store = useStore();
    const { isReady, accountManager } = useRobonomics();
    const { config, load } = useConfig();
    const isKey = ref(false);
    const type = ref("libp2p");

    onUnmounted(async () => {
      if (
        isReady.value &&
        isKey.value &&
        store.state.robonomicsUIvue.polkadot.address !==
          accountManager.account.address
      ) {
        try {
          const accountOld = store.state.robonomicsUIvue.polkadot.accounts.find(
          (item) =>
              item.address === store.state.robonomicsUIvue.polkadot.address
          );
          if (accountOld) {
            await accountManager.setSender(accountOld.address, {
              type: accountOld.type,
              extension: store.state.robonomicsUIvue.polkadot.extensionObj
            });
          }
        } catch (e) { console.error(e); }
      }
    });

    watch(
      () => store.state.robonomicsUIvue.rws.user.key,
      async (key) => {
        if (key) {
          await accountManager.addPair(key);
          isKey.value = true;
          load();
        } else {
          console.log("NOT KEY");
        }
      },
      { immediate: true }
    );

    return {
      type,
      isKey,
      config,
      handlerConnected: (result) => {
        store.dispatch("app/setlibp2p", {
          connected: true
        });
        let relay = false;
        if (result.protoNames().includes("p2p-circuit")) {
          relay = true;
        }
        store.dispatch("app/setrelay", {
          connected: relay
        });
      },
      handlerError: (e) => {
        console.log(e.message);
        console.log("switch to parachain");
        type.value = "parachain";
        store.dispatch("app/setlibp2p", {
          connected: false
        });
        store.dispatch("app/setrelay", {
          connected: false
        });
      }
    };
  }
};
</script>
