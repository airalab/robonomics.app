<template>
  <robo-layout-section>
    <robo-section offset="x2" width="narrow" style="text-align: center">
      <h2>Digital Twin</h2>
    </robo-section>

    <robo-section offset="x2" width="narrow" v-if="isConnected">
      <d-twin />
    </robo-section>
  </robo-layout-section>
</template>

<script>
import { usePolkadotApi } from "robonomics-interface-vue";
import DTwin from "./DTwin.vue";

export default {
  components: { DTwin },
  setup() {
    const { isConnected } = usePolkadotApi();

    return { isConnected };
  }
};
</script>
