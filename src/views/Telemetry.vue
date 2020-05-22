<template>
  <Page>
    <section>
      <h1>
        <span class="d-block">{{ $t("statistics_header") }}</span>
        <!-- <RLabel color="green" small class="align-top" v-if="connected">{{ $t("сonnected") }}</RLabel>
        <RLabel color="orange" small class="align-top" v-else>{{ $t("no_сonnected") }}</RLabel>-->
        <p class="m-b-0 t-sm" v-if="Object.values(nodes).length === 0">
          <i>{{ $t("waiting") }}</i>
        </p>
      </h1>
    </section>
    <!-- <Statistic /> -->
    <Net />
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import { mapState } from "vuex";
// import Statistic from "../components/telemetry/Statistic";
import Net from "../components/telemetry/Net";

export default {
  components: {
    Page,
    // Statistic,
    Net
  },
  computed: mapState({
    // connected: state => state.statistics.connected,
    nodes: (state) => state.net.nodes
  }),
  created() {
    // this.$store.dispatch("statistics/init");
    this.$store.dispatch("net/init");
  }
};
</script>
