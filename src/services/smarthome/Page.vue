<template>
  <robo-grid-item>
    <overview />
    <subscription
      @controller="
        (result) => {
          controller = result;
        }
      "
    />
    <get-telemetry
      :controller="controller"
      @telemetry="
        (result) => {
          telemetry = result;
        }
      "
    />
    <ViewTelemetry v-if="telemetry" :telemetry="telemetry" />
  </robo-grid-item>
</template>

<script>
import Overview from "./Overview.vue";
import Subscription from "./Subscription.vue";
import GetTelemetry from "./GetTelemetry.vue";
import ViewTelemetry from "./ViewTelemetry.vue";

export default {
  components: { Overview, Subscription, GetTelemetry, ViewTelemetry },
  data() {
    return {
      controller: null,
      telemetry: null
    };
  }
};
</script>
