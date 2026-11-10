<template>
  <robo-layout-section>
    <robo-rws-setup-new
      :onRequestSubscription="onRequestSubscription"
      :onSetupGenerate="onSetupGenerate"
    />
    <help-link
      page="connect-devices#home-assistant"
      text="The controller account comes from the Home Assistant integration."
    />
  </robo-layout-section>
</template>

<script setup>
import { logger } from "@/utils/logger";
import { usePolkadotApi } from "robonomics-interface-vue";
import { useQuery as useQuerySubscription } from "robonomics-interface-vue/subscription";
import { watch } from "vue";

const { isConnected } = usePolkadotApi();
const { load: getLedger } = useQuerySubscription();

const onRequestSubscription = async (address, send) => {
  watch(
    isConnected,
    async (isConnected) => {
      if (isConnected) {
        try {
          const ledger = await getLedger(address);
          if (ledger) {
            send(ledger.validUntil);
          } else {
            send(null);
          }
        } catch (e) {
          logger.error(e);
          send(null);
        }
      }
    },
    { immediate: true }
  );
};

const onSetupGenerate = async () => {};
</script>
