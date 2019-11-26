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
      <Sensors
        :lighthouse="lighthouse"
        :model="model"
        :agent="agent"
        :result="result"
      />
    </section>
  </Page>
</template>

<script>
import Page from "../components/Page";
import Sensors from "../components/sensors/Sensors";

const namesModels = {
  Qmd6bn2JGW26hSx7g5gVCmfgB7uigRPrhAukJn77ee3bMM: "Теплица"
};

export default {
  props: ["lighthouse", "model", "agent", "result"],
  components: {
    Page,
    Sensors
  },
  data() {
    return {
      ready: false,
      isRequest: false,
      log: [],
      storeKey: `sn_${this.lighthouse}_${this.model}_${this.agent}`
    };
  },
  computed: {
    miniAddrAgent: function() {
      return this.agent.slice(0, 6) + "..." + this.agent.slice(-4);
    },
    nameModel: function() {
      return Object.prototype.hasOwnProperty.call(namesModels, this.model)
        ? namesModels[this.model]
        : "unknown";
    }
  }
};
</script>
