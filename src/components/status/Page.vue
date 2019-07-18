<template>
  <fragment>
    <section>
      <h1>
        <span class="d-block">{{ $t('statistics_header') }}</span>
        <span class="label label-green t-sm align-top" v-if="connected">{{ $t('сonnected') }}</span>
        <span class="label label-orange t-sm align-top" v-else>{{ $t('no_сonnected') }}</span>
        <p class="m-b-0 t-sm" v-if="Object.values(nodes).length===0">
          <i>{{ $t('waiting') }}</i>
        </p>
      </h1>
    </section>
    <Statistic />
    <Net />
  </fragment>
</template>

<script>
import { mapState } from "vuex";
import Statistic from "./Statistic";
import Net from "./Net";

export default {
  components: {
    Statistic,
    Net
  },
  computed: mapState({
    connected: state => state.statistics.connected,
    nodes: state => state.net.nodes
  }),
  created() {
    this.$store.dispatch("statistics/init");
    this.$store.dispatch("net/init");
  }
};
</script>
