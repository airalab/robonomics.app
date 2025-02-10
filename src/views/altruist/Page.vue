<template>
  <robo-layout-section>
    <robo-section offset="x2" width="middle" style="text-align: center">
      <h2>Altruist</h2>
    </robo-section>

    <robo-section offset="x2" width="middle">
      <datalog-loader v-if="isFind" />
      <robo-status v-else-if="altruistAddress === null" type="warning">
        Not found
      </robo-status>
      <altruist-chart
        v-else-if="altruistAddress !== undefined"
        :address="altruistAddress"
      />
    </robo-section>

    <robo-section offset="x2" width="middle">
      <notice-text />
    </robo-section>
  </robo-layout-section>
</template>

<script>
import { watch } from "vue";
import AltruistChart from "./AltruistChart.vue";
import DatalogLoader from "./DatalogLoader.vue";
import NoticeText from "./NoticeText.vue";
import { useFindAltruist } from "./dtwin.js";

export default {
  props: ["address"],
  components: { AltruistChart, DatalogLoader, NoticeText },
  setup(props) {
    const { address: altruistAddress, isFind, runFind } = useFindAltruist();

    watch(
      () => props.address,
      (address) => {
        if (address) {
          altruistAddress.value = address;
        } else {
          runFind();
        }
      },
      { immediate: true }
    );

    return {
      altruistAddress,
      isFind
    };
  }
};
</script>
