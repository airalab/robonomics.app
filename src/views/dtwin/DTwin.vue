<template>
  <robo-section offset="x05">
    <robo-grid offset="x0" gap="x05" columns="1">
      <select-twin @change="(r) => (twinId = r)" :key="keySelect" />
      <create-twin :owner="owner" @create="keySelect++" />
    </robo-grid>
  </robo-section>
  <template v-if="twinId >= 0">
    <robo-section offset="x2">
      <robo-grid offset="x0" gap="x05" columns="1">
        <twin-records :id="twinId" :key="keyRecords" />
        <form-source :owner="owner" :id="twinId" @create="keyRecords++" />
      </robo-grid>
    </robo-section>
  </template>
</template>

<script>
import { ref } from "vue";
import CreateTwin from "./CreateTwin.vue";
import FormSource from "./FormSource.vue";
import SelectTwin from "./SelectTwin.vue";
import TwinRecords from "./TwinRecords.vue";

export default {
  props: ["owner"],
  components: { SelectTwin, CreateTwin, TwinRecords, FormSource },
  setup() {
    return {
      twinId: ref(),
      keySelect: ref(0),
      keyRecords: ref(0)
    };
  }
};
</script>
