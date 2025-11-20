<template>
  <robo-layout>
    <dapp-header :title="props.pagetitle" />
    <slot />
    <dapp-footer />
  </robo-layout>
</template>

<script setup>
import DappFooter from "@/components/Footer";
import DappHeader from "@/components/Header";
import { useDevices } from "robonomics-interface-vue/devices";
import { useSubscription } from "robonomics-interface-vue/subscription";
import { defineProps, ref, watch } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  pagetitle: {
    type: String
  }
});

const store = useStore();
const owner = ref();
const { data: subscription } = useSubscription(owner, { immediate: false });
const { data: dataDevices } = useDevices(owner, { immediate: false });

watch(
  () => store.state.robonomicsUIvue.rws.active,
  (v) => {
    owner.value = v;
  },
  { immediate: true }
);

watch(
  [owner, subscription],
  () => {
    if (subscription.value) {
      store.commit("rws/setExpiredate", subscription.value.validUntil);
    }
  },
  { immediate: true }
);

watch(
  dataDevices,
  (devices) => {
    store.commit("rws/setUsers", devices);
  },
  { immediate: true }
);
</script>
