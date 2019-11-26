<template>
  <Page>
    <section>
      <h2 class="breadcrumbs m-b-0">
        <span>
          <span class="i-signal m-r-10"></span>
          <span>Sensor networks</span>
        </span>
        <i>/</i>
        <span>{{ lighthouse }}</span>
      </h2>
      <SelectLighthouse
        :isCreate="false"
        :selectedLighthouse="lighthouseName"
        @connect="onChangeLighthouse"
      />
      <Sensors :lighthouse="lighthouse" :model="model" :agent="agent" :result="result" />
    </section>
  </Page>
</template>

<script>
import Page from "../components/Page";
import Sensors from "../components/sensors/Sensors";
import SelectLighthouse from "../components/lighthouse/SelectLighthouse";

export default {
  props: ["lighthouse", "model", "agent", "result"],
  components: {
    Page,
    SelectLighthouse,
    Sensors
  },
  data() {
    return {
      ready: false,
      isRequest: false,
      lighthouseName: "",
      log: [],
      storeKey: ""
    };
  },
  mounted() {
    this.lighthouseName = `${this.lighthouse}.lighthouse.5.robonomics.eth`;
  },
  methods: {
    onChangeLighthouse(lighthouse) {
      this.$router.push({
        name: "sensors",
        params: {
          lighthouse: lighthouse.split(".")[0],
          model: this.model,
          agent: this.agent
        }
      });
      this.$router.go();
    }
  }
};
</script>
