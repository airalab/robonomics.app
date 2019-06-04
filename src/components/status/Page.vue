<template>
  <div>
    <section>
      <h1>
        <span class="d-block">{{ $t('statistics_header') }}</span>
        <span class="t-label--green t-sm align-top" v-if="connected">{{ $t('сonnected') }}</span>
        <span class="t-label--orange t-sm align-top" v-else>{{ $t('no_сonnected') }}</span>
      </h1>
    </section>
    <Statistic/>
    <Net/>
  </div>
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
  computed: mapState("statistics", ["connected"]),
  created() {
    this.$store.dispatch("statistics/init");
    this.$store.dispatch("net/init");
  }
};
</script>
