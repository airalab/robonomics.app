<template>
  <div v-if="isLaoded">
    <datalog-chart :log="log" />
    <sensor-info :sensor_id="address" class="block" />
    <last-data :data="log[log.length - 1]" class="block" />
  </div>
  <datalog-loader v-else />
</template>

<script>
import { useDatalog } from "robonomics-interface-vue/datalog";
import { computed, ref, toRefs } from "vue";
import DatalogLoader from "../../components/hardware/DatalogLoader.vue";
import SensorInfo from "../../components/hardware/SensorInfo.vue";
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
    const { loading, data } = useDatalog(toRefs(props).address);

    const log = computed(() => {
      if (!data.value) {
        return [];
      }
      const log = [];
      for (const item of data.value) {
        log.push({
          moment: item[0],
          data: parser(item[1]),
          raw: item[1]
        });
      }
      return log;
    });

    const isShowRaw = ref(false);
    const showRaw = () => {
      isShowRaw.value = !isShowRaw.value;
    };

    return {
      log: log,
      isLaoded: loading,
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
