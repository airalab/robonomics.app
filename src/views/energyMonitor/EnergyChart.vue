<template>
  <datalog-loader v-if="isLoading" />
  <robo-status v-else-if="error" type="error">
    Could not read this sensor's data from the chain
  </robo-status>
  <robo-status v-else-if="!log.length" type="warning">
    No measurements from this sensor yet
  </robo-status>
  <div v-else>
    <datalog-chart :log="log" />
    <sensor-info :sensor_id="address" class="block" />
    <last-data :data="log[log.length - 1]" class="block" />
  </div>
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
    const { loading, error, data } = useDatalog(toRefs(props).address);

    const log = computed(() => {
      if (!data.value) {
        return [];
      }
      const log = [];
      for (const item of data.value) {
        const parsed = parser(item[1]);
        // skip records in other formats (e.g. IPFS hashes): a reading
        // has at least one numeric value
        if (!parsed || !parsed.some((m) => isFinite(parseFloat(m.value)))) {
          continue;
        }
        log.push({
          moment: item[0],
          data: parsed,
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
      // nothing loaded yet counts as loading, so "no data" does not flash first
      isLoading: computed(
        () => loading.value || (data.value === null && !error.value)
      ),
      error,
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
