<template>
  <div v-if="isLaoded">
    <datalog-chart :log="log" />
    <sensor-info :sensor_id="address" class="block" />
    <measurements-scalegrid :log="log" class="block" />
  </div>
  <datalog-loader v-else />
</template>

<script>
import { ref, toRefs } from "vue";
import { useDatalog } from "./datalog";
import DatalogChart from "./DatalogChart.vue";
import DatalogLoader from "./DatalogLoader.vue";
import MeasurementsScalegrid from "./MeasurementsScalegrid.vue";
import SensorInfo from "./SensorInfo.vue";

export default {
  props: ["address"],
  components: {
    DatalogLoader,
    DatalogChart,
    SensorInfo,
    MeasurementsScalegrid
  },
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

<style scoped>
.block {
  margin: 15px 0;
}
</style>
