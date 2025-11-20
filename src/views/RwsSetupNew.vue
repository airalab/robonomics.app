<template>
  <robo-layout-section>
    <robo-rws-setup-new
      :onRequestSubscription="onRequestSubscription"
      :onSetupGenerate="onSetupGenerate"
    />
  </robo-layout-section>
</template>

<script setup>
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
          console.log(e);
          send(null);
        }
      }
    },
    { immediate: true }
  );
};

const onSetupGenerate = async () => {};
</script>
