<template>
  <robo-layout-section>
    <robo-section offset="x2" width="middle" style="text-align: center">
      <h2>Energy Monitor</h2>
    </robo-section>

    <robo-section offset="x2" width="middle">
      <datalog-loader v-if="isFind" />
      <robo-status v-else-if="energyAddress === null" type="warning">
        Not found
      </robo-status>
      <energy-chart
        v-else-if="energyAddress !== undefined"
        :address="energyAddress"
      />
    </robo-section>

    <robo-section offset="x2" width="middle">
      <notice-text />
    </robo-section>
  </robo-layout-section>
</template>

<script>
import { watch } from "vue";
import DatalogLoader from "../../components/hardware/DatalogLoader.vue";
import NoticeText from "../../components/hardware/NoticeText.vue";
import { useFind } from "../../components/hardware/hooks/dtwin.js";
import EnergyChart from "./EnergyChart.vue";

export default {
  props: ["address"],
  components: { EnergyChart, DatalogLoader, NoticeText },
  setup(props) {
    const {
      address: energyAddress,
      isFind,
      runFind
    } = useFind(
      "0x000000000000000000000000000000000000000000000000616c747275697374"
    );

    watch(
      () => props.address,
      (address) => {
        if (address) {
          energyAddress.value = address;
        } else {
          runFind();
        }
      },
      { immediate: true }
    );

    return {
      energyAddress,
      isFind
    };
  }
};
</script>
