<template>
  <robo-layout-section>
    <robo-section offset="x2" width="narrow" style="text-align: center">
      <h2>Digital Twin</h2>
    </robo-section>

    <robo-section offset="x2" width="narrow">
      <d-twin />
    </robo-section>
  </robo-layout-section>
</template>

<script>
import DTwin from "./DTwin.vue";

export default {
  components: { DTwin }
};
</script>
