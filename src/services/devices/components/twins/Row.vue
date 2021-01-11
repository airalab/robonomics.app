<template>
  <div class="item">
    <template v-if="data">
      <Properties :schema="schema" :data="data" />
      <code class="data">{{ data }}</code>
    </template>
    <template v-else>
      <span>-</span>
    </template>
  </div>
</template>

<script>
import Properties from "./template/Properties";
import JSON5 from "json5";

export default {
  props: ["schema", "value"],
  components: {
    Properties
  },
  data() {
    return {
      addr: "",
      log: [],
      currentPage: 0,
      unsubscribe: null
    };
  },
  computed: {
    data: function () {
      try {
        return JSON5.parse(this.value.data);
      } catch (error) {
        return this.value.data;
      }
    }
  }
};
</script>

<style scoped>
.item {
  border: 1px solid #eee;
}
.data {
  padding: 10px;
  font-size: 12px;
  display: block;
}
</style>
