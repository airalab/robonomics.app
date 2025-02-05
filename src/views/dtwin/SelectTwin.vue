<template>
  <robo-select
    v-if="twins !== undefined && twins.length > 0"
    :options="twins"
    :values="twins"
    v-model="twinId"
    size="small"
    label="Choose digital twin"
    block
  />
  <robo-status v-else-if="twins !== undefined && !isLoading" type="warning">
    Digital twins do not exist
  </robo-status>
  <robo-text v-if="isLoading" weight="normal-italic" align="center">
    <robo-loader size="1.5" /> Loading
  </robo-text>
</template>

<script>
import { ref, watch } from "vue";
import { useTwins } from "./dtwin";

export default {
  emits: ["change"],
  setup(_, { emit }) {
    const { twins, isLoading } = useTwins(true);
    const twinId = ref();

    watch(
      twins,
      (twins) => {
        if (twinId.value === undefined && twins && twins.length > 0) {
          twinId.value = twins[twins.length - 1];
        }
      },
      { immediate: true }
    );

    watch(twinId, (twinId) => {
      emit("change", twinId);
    });

    return {
      twins,
      twinId,
      isLoading
    };
  }
};
</script>
