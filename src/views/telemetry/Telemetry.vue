<template>
  <Libp2p
    v-if="type === 'libp2p'"
    :config="config"
    :cid="cid"
    :isKey
    @connected="handlerConnected"
    @error="handlerError"
  />
  <Launch v-else :config="config" :cid="cid" :isKey />
</template>

<script>
import { logger } from "@/utils/logger";
import { usePolkadotApi } from "robonomics-interface-vue";
import { useAccount } from "robonomics-interface-vue/account";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { useAccounts } from "../../hooks/useAccounts";
import Launch from "./Launch.vue";
import Libp2p from "./Libp2p.vue";
import { useConfig } from "./common";

export default {
  components: { Libp2p, Launch },
  setup() {
    const store = useStore();
    const { isConnected: isReady } = usePolkadotApi();
    const { account } = useAccount();
    const { setFromPair, setSender } = useAccounts();
    const { config, cid, load } = useConfig();
    const isKey = ref(false);

    const type = computed(() => {
      /* always has a value, default is 'libp2p' */
      return store.state.robonomicsUIvue.polkadot.connection.type;
    });

    onMounted(() => {
      // store.commit("polkadot/setConnectionConnected", false);
      store.commit("polkadot/setConnectionStatus", null);
    });

    onUnmounted(async () => {
      if (
        isReady.value &&
        isKey.value &&
        store.state.robonomicsUIvue.polkadot.address !== account.value
      ) {
        try {
          const accountOld = store.state.robonomicsUIvue.polkadot.accounts.find(
            (item) =>
              item.address === store.state.robonomicsUIvue.polkadot.address
          );
          if (accountOld) {
            await setSender(
              accountOld.address,
              store.state.robonomicsUIvue.polkadot.extensionObj.signer,
              accountOld.type
            );
          }
        } catch (e) {
          logger.error(e);
        }
      }
    });

    watch(
      () => isReady.value,
      (v) => {
        if (type.value === "parachain") {
          store.commit("polkadot/setConnectionConnected", v);
        }
      },
      { immediate: true }
    );

    watch(
      () => store.state.robonomicsUIvue.rws.user.key,
      async (key) => {
        if (key) {
          await setFromPair(key);
          logger.log("User:", account.value);
          isKey.value = true;
          load();
        } else {
          logger.warn("User: key not found");
        }
      },
      { immediate: true }
    );

    return {
      store,
      type,
      isKey,
      config,
      cid,
      handlerConnected: (result) => {
        store.commit("polkadot/setConnectionType", "libp2p");
        if (
          result
            .getComponents()
            .map(({ name }) => name)
            .includes("p2p-circuit")
        ) {
          store.commit("polkadot/setConnectionStatus", "via relay");
        } else {
          store.commit("polkadot/setConnectionStatus", null);
        }
        store.commit("polkadot/setConnectionConnected", true);
      },
      handlerError: (e) => {
        logger.warn(e);
        logger.info("Switching to parachain");

        store.commit("polkadot/setConnectionType", "parachain");
        store.commit("polkadot/setConnectionConnected", true);
        store.commit(
          "polkadot/setConnectionStatus",
          null
        ); /* delete message about relay if it was there */
      }
    };
  }
};
</script>
