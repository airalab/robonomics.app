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
    <robo-section>
      <robo-template-telemetry :data="telemetry" />
    </robo-section>
  </robo-grid-item>
</template>

<script>
import Overview from "./Overview.vue";
import Subscription from "./Subscription.vue";
import GetTelemetry from "./GetTelemetry.vue";

export default {
  components: { Overview, Subscription, GetTelemetry },
  data() {
    return {
      controller: null,
      telemetry: null
    };
  }
};
</script>
