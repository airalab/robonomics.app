<template>
  <div v-if="isLaoded">
    <datalog-chart :log="log" />
    <robo-button @click="showRaw">Raw</robo-button>
    <datalog-list v-if="isShowRaw" :log="log" />
  </div>
  <datalog-loader v-else />
</template>

<script>
import { ref, toRefs } from "vue";
import { useDatalog } from "./datalog";
import DatalogChart from "./DatalogChart.vue";
import DatalogList from "./DatalogList.vue";
import DatalogLoader from "./DatalogLoader.vue";

export default {
  props: ["address"],
  components: { DatalogList, DatalogLoader, DatalogChart },
  setup(props) {
    const datalog = useDatalog(toRefs(props).address);

    const isShowRaw = ref(false);
    const showRaw = () => {
      isShowRaw.value = !isShowRaw.value;
    };

    return {
      log: datalog.log,
      isLaoded: datalog.isLaoded,
      isShowRaw,
      showRaw
    };
  }
};
</script>
