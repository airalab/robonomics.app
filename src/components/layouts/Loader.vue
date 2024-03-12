<template>
  <robo-layout>
    <dapp-header :title="pagetitle" />
    <slot />
  </robo-layout>
</template>

<script>
import DappHeader from "@/components/Header";

export default {
  components: {
    DappHeader
  },
  props: ['pagetitle']
};
</script>
