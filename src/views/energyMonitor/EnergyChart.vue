<template>
  <div v-if="isLaoded">
    <datalog-chart :log="log" />
    <sensor-info :sensor_id="address" class="block" />
    <last-data :data="log[log.length - 1]" class="block" />
  </div>
  <datalog-loader v-else />
</template>

<script>
import { ref, toRefs } from "vue";
import DatalogLoader from "../../components/hardware/DatalogLoader.vue";
import SensorInfo from "../../components/hardware/SensorInfo.vue";
import { useDatalog } from "../../components/hardware/hooks/datalog";
import DatalogChart from "./DatalogChart.vue";
import LastData from "./LastData.vue";
import { parser } from "./parser";

export default {
  props: ["address"],
  components: {
    DatalogLoader,
    DatalogChart,
    SensorInfo,
    LastData
  },
  setup(props) {
    const datalog = useDatalog(toRefs(props).address, parser);

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

<style scoped>
.block {
  margin: 15px 0;
}
</style>
