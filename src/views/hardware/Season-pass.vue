<template>
  <robo-layout-section>
    Season pass
    <hr/>
    {{store.state.robonomicsUIvue.ethereum.activeAccount}}
    <hr/>
    {{store.state.robonomicsUIvue.ethereum.activeProviderUuid}}
  </robo-layout-section>
</template>

<script setup>
import { useStore } from "vuex";
const store = useStore();
</script>
