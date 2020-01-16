<template>
  <Page>
    <section>
      <h2 class="breadcrumbs m-b-0">
        <span>
          <span class="i-signal m-r-10"></span>
          <span>{{ $t("sensors.title") }}</span>
        </span>
        <i>/</i>
        <span>{{ nameModel }} {{ miniAddrAgent }}</span>
      </h2>
      <SensorResult
        v-if="result"
        :lighthouse="lighthouse"
        :model="model"
        :agent="agent"
        :result="result"
      />
      <SensorCost
        v-else-if="cost>0"
        :lighthouse="lighthouse"
        :model="model"
        :agent="agent"
        :token="token"
        :cost="cost"
      />
      <SensorFree v-else :lighthouse="lighthouse" :model="model" :agent="agent" :result="result" />
    </section>
  </Page>
</template>

<script>
import Page from "../components/Page";
import SensorFree from "../components/sensor/SensorFree";
import SensorCost from "../components/sensor/SensorCost";
import SensorResult from "../components/sensor/SensorResult";
import config from "~config";

export default {
  props: ["lighthouse", "model", "agent", "result", "token", "cost"],
  components: {
    Page,
    SensorFree,
    SensorCost,
    SensorResult
  },
  computed: {
    miniAddrAgent: function() {
      return this.agent.slice(0, 6) + "..." + this.agent.slice(-4);
    },
    nameModel: function() {
      return Object.prototype.hasOwnProperty.call(
        config.CATEGORY_MODELS,
        this.model
      )
        ? config.CATEGORY_MODELS[this.model]
        : "unknown";
    }
  }
};
</script>
