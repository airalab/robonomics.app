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
import { useSend } from "robonomics-interface-vue/account";
import { useAction } from "robonomics-interface-vue/twin";
import { ref } from "vue";

export default {
  props: ["owner"],
  emits: ["change"],
  setup(props, { emit }) {
    const action = useAction();
    const { tx } = useSend();

    const isProccess = ref(false);
    const isSuccess = ref(false);

    return {
      isProccess,
      isSuccess,
      create: async () => {
        isSuccess.value = false;
        isProccess.value = true;
        await tx.send(() => action.create(), { subscription: props.owner });

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
