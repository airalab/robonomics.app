<template>
  <robo-section offset="x05">
    <robo-grid offset="x0" gap="x05" columns="1">
      <robo-text title="3" offset="x0">Add source</robo-text>
      <robo-input v-model="topic" label="Topic" block />
      <robo-input v-model="source" label="Source" block />
      <robo-button
        @click="setSource"
        block
        :disabled="isProccess"
        :loading="isProccess"
        :type="isSuccess ? 'ok' : 'primary'"
      >
        Save
      </robo-button>
    </robo-grid>
  </robo-section>
</template>

<script>
import { ref } from "vue";
import { useTwinAction } from "./dtwin";

export default {
  props: ["id", "owner"],
  setup(props, { emit }) {
    const { setSource } = useTwinAction(props.owner);
    const topic = ref();
    const source = ref();
    const isProccess = ref(false);
    const isSuccess = ref(false);

    return {
      topic,
      source,
      isProccess,
      isSuccess,
      setSource: async () => {
        isSuccess.value = false;
        isProccess.value = true;
        const tx = await setSource(props.id, topic.value, source.value);
        if (tx.error.value) {
          if (tx.error.value !== "Cancelled") {
            console.log(tx.error.value);
          } else {
            console.log("cancel");
          }
          isProccess.value = false;
          return false;
        }
        isProccess.value = false;
        isSuccess.value = true;
        emit("create");
      }
    };
  }
};
</script>
