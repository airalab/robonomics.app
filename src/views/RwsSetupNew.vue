<template>
  <robo-layout-section>
    <robo-rws-setup-new
      :onRequestSubscription="onRequestSubscription"
      :onSetupGenerate="onSetupGenerate"
    />
  </robo-layout-section>
</template>

<script setup>
import { getDevices } from "@/hooks/useDevices";
import { useRobonomics } from "@/hooks/useRobonomics";
import { useSend } from "@/hooks/useSend";
import { getLedger, getValidUntil } from "@/hooks/useSubscription";
import { nextTick, watch } from "vue";

const { isReady, getInstance } = useRobonomics();
const transaction = useSend();

const onRequestSubscription = async (address, send) => {
  watch(
    isReady,
    async (isReady) => {
      if (isReady) {
        try {
          const robonomics = getInstance();
          const ledger = await getLedger(robonomics, address);
          send(getValidUntil(ledger));
        } catch (e) {
          console.log(e);
          send(null);
        }
      }
    },
    { immediate: true }
  );
};

const onSetupGenerate = async (config, setStatus) => {
  console.log('onSetupGenerate', config)
  watch(
    isReady,
    async (isReady) => {
      if (isReady) {
        try {
          const robonomics = getInstance();
          if (robonomics.accountManager.account.address !== config.owner) {
            setStatus("error", "owner != signer");
            return;
          }
          const devices = await getDevices(robonomics, config.owner);
          if (devices.includes(config.controller.address)) {
            setStatus("ok", "Setup saved");
            if (stop) {
              stop();
            } else {
              nextTick(() => {
                stop();
              });
            }
            return;
          }
          const call = await robonomics.rws.setDevices([
            ...devices,
            config.controller.address
          ]);
          const tx = transaction.createTx();
          if (devices.includes(config.owner)) {
            await transaction.send(tx, call, config.owner);
          } else {
            await transaction.send(tx, call);
          }
          if (tx.error.value) {
            if (tx.error.value !== "Cancelled") {
              setStatus("error", tx.error.value);
            } else {
              setStatus("error", 'cancel');
            }
            return;
          } else {
            setStatus("ok", "Setup saved");
          }
        } catch (e) {
          console.log(e);
          setStatus("error", e);
        }
      }
    },
    { immediate: true }
  );
};
</script>
