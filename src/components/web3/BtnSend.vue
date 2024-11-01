<template>
  <button
    @click="send"
    :disabled="status === STATUS.PRE_PROCESS || status === STATUS.WAIT_TX"
  >
    <slot />
  </button>
  <div v-if="status === STATUS.ERROR" class="error">{{ error }}</div>
  <div v-if="status === STATUS.READY" class="success">✓</div>
</template>

<script>
import { ref } from "vue";

const STATUS = {
  NEW: 1,
  PRE_PROCESS: 2,
  WAIT_TX: 3,
  READY: 4,
  ERROR: 5
};

export default {
  emits: ["click"],
  setup(_, { emit }) {
    const status = ref(STATUS.NEW);
    const error = ref(null);

    const send = async () => {
      status.value = STATUS.PRE_PROCESS;
      error.value = null;
      emit("click", async (tx, e, last = true) => {
        status.value = STATUS.WAIT_TX;
        try {
          if (tx) {
            const receipt = await tx.wait();
            console.log(receipt.hash);
            if (last) {
              status.value = STATUS.READY;
            }
          } else if (e) {
            if (e.code !== "ACTION_REJECTED") {
              status.value = STATUS.ERROR;
              error.value = e.code || e;
            } else {
              status.value = STATUS.NEW;
            }
          }
        } catch (errorCatch) {
          status.value = STATUS.ERROR;
          error.value = errorCatch.message;
        }
      });
    };

    return {
      STATUS,
      status,
      error,
      send
    };
  }
};
</script>
