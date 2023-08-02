<template>
  <robo-layout-section rwsrecover>
    <robo-template-rws-setup
      v-model:owner="ownerNew"
      v-model:controller="controllerNew"
      v-model:scontroller="scontrollerNew"
      v-model:name="nameNew"
      v-model:enddate="enddateNew"
      @on-rws-setup="onSetup"
    />
  </robo-layout-section>
</template>

<script>
import { useSubscription } from "@/hooks/useSubscription";
import { ref } from "vue";

export default {
  setup() {
    const ownerNew = ref(null);
    const controllerNew = ref(null);
    const scontrollerNew = ref(null);
    const nameNew = ref(null);

    const subscription = useSubscription(ownerNew);

    const onSetup = (rwsStatus) => {
      rwsStatus("ok");
    };

    return {
      ownerNew,
      controllerNew,
      scontrollerNew,
      nameNew,
      enddateNew: subscription.validUntil,
      onSetup
    };
  }
};
</script>
