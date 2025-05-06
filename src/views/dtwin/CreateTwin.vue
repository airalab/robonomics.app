<template>
  <robo-button
    @click="create"
    block
    :disabled="isProccess"
    :loading="isProccess"
    :type="isSuccess ? 'ok' : 'primary'"
  >
    Create new
  </robo-button>
</template>

<script>
import { ref } from "vue";
import { useTwinAction } from "./dtwin.js";

export default {
  props: ["owner"],
  emits: ["change"],
  setup(props, { emit }) {
    const { create } = useTwinAction(props.owner);
    const isProccess = ref(false);
    const isSuccess = ref(false);

    return {
      isProccess,
      isSuccess,
      create: async () => {
        isSuccess.value = false;
        isProccess.value = true;
        const tx = await create();
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
