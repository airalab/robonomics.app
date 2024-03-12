<template>
  <robo-layout>
    <dapp-header :title="pagetitle" />
    <slot />
  </robo-layout>
</template>

<script>
import DappHeader from "@/components/Header";
import { useSubscription } from "@/hooks/useSubscription";
import { watch } from "vue";
import { useStore } from "vuex";

export default {
  components: {
    DappHeader
  },
  props: ['pagetitle'],
  setup() {
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
  }
};
</script>
