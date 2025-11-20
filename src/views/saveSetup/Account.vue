<template>
  <div>
    Account seed:
    <robo-input v-model="seed" />
    <robo-button @click="unlock">unlock</robo-button>
  </div>
</template>

<script>
import { ref } from "vue";
import { useAccounts } from "../../hooks/useAccounts";

export default {
  name: "AccountUnlock",
  emits: ["unlock"],
  setup(_, { emit }) {
    const seed = ref("");

    const { setFromUri } = useAccounts();

    const unlock = async () => {
      try {
        await setFromUri(seed.value);
      } catch (error) {
        console.log(error);
        return;
      }
      // console.log(robonomics.accountManager.account.address);

      emit("unlock");
    };

    return {
      seed,
      unlock
    };
  }
};
</script>
