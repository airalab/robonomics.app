<template>
  <robo-layout>
    <dapp-header :title="props.pagetitle" />
    <slot />
    <dapp-footer />
  </robo-layout>
</template>

<script setup>

import DappHeader from '@/components/Header';
import DappFooter from '@/components/Footer';
import { useSubscription } from "@/hooks/useSubscription";
import { defineProps, watch } from 'vue';
import { useStore } from "vuex";

const props = defineProps({
  pagetitle: {
    type: String
  }
});

const store = useStore();
const subscription = useSubscription();

 watch(
  () => store.state.robonomicsUIvue.rws.active,
  (v) => {
    subscription.owner.value = v;
  },
  { immediate: true }
);

watch(
  [subscription.owner, subscription.validUntil],
  () => {
    store.commit("rws/setExpiredate", subscription.validUntil);
  },
  { immediate: true }
);

watch(
  subscription.devices,
  (devices) => {
    store.commit("rws/setUsers", devices);
  },
  { immediate: true }
);
</script>
