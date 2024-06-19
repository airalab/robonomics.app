<template>
  <Libp2p
    v-if="type === 'libp2p'"
    :config="config"
    :isKey
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
    const robonomics = useRobonomics();
    const { config, load } = useConfig();
    const isKey = ref(false);
    const type = ref(store.state.robonomicsUIvue.rws.connection);

    onUnmounted(async () => {
      if (
        isKey.value &&
        store.state.robonomicsUIvue.polkadot.address !==
          robonomics.accountManager.account.address
      ) {
        const accountOld = store.state.robonomicsUIvue.polkadot.accounts.find(
          (item) =>
            item.address === store.state.robonomicsUIvue.polkadot.address
        );
        if (accountOld) {
          await robonomics.accountManager.setSender(accountOld.address, {
            type: accountOld.type,
            extension: store.state.robonomicsUIvue.polkadot.extensionObj
          });
        }
      }
    });

    watch(
      () => store.state.robonomicsUIvue.rws.user.key,
      async (value) => {
        if (value) {
          await robonomics.accountManager.addPair(value);
          isKey.value = true;
          load();
        } else {
          console.log("NOT KEY");
        }
      }
    );

    watch(
      () => store.state.robonomicsUIvue.rws.connection,
      async (value) => {
        type.value = value;
      }
    );

    return {
      type,
      isKey,
      config,
      handlerError: () => {
        store.commit("rws/setConnection", "parachain");
      }
    };
  }
};
</script>
