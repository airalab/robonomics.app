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
      <modals-container />
      <SensorResult
        v-if="result"
        :lighthouse="lighthouse"
        :model="model"
        :agent="agent"
        :result="result"
      />
      <SensorResultSubstrate
        v-if="substrateBlock"
        :lighthouse="lighthouse"
        :model="model"
        :agent="agent"
        :substrateBlock="substrateBlock"
        :substrateTx="substrateTx"
      />
      <SensorCost
        v-else-if="cost > 0"
        :lighthouse="lighthouse"
        :model="model"
        :agent="agent"
        :tokenAddress="token"
        :cost="cost"
      />
      <SensorFree v-else :lighthouse="lighthouse" :model="model" :agent="agent" :result="result" />
    </section>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import SensorFree from "./SensorFree";
import SensorCost from "./SensorCost";
import SensorResult from "./SensorResult";
import SensorResultSubstrate from "./SensorResultSubstrate";
import config from "~config";

export default {
  props: [
    "lighthouse",
    "model",
    "agent",
    "result",
    "substrateBlock",
    "substrateTx",
    "token",
    "cost"
  ],
  components: {
    Page,
    SensorFree,
    SensorCost,
    SensorResult,
    SensorResultSubstrate
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
  },
  created() {
    document.title = `${this.$t("sensors.title")} ${
      this.nameModel
    } – Robonomics Network dApp`;
  }
};
</script>
