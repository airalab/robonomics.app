<template>
  <robo-layout>
    <dapp-header :title="title" />
    <slot />
  </robo-layout>
</template>

<script>
import DappHeader from "@/components/Header";

export default {
  components: {
    DappHeader
  }
};
</script>
