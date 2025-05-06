<template>
  <div>
    Account seed:
    <robo-input v-model="seed" />
    <robo-button @click="unlock">unlock</robo-button>
  </div>
</template>

<script>
import { useRobonomics } from "@/hooks/useRobonomics";
import { ref } from "vue";

export default {
  name: "AccountUnlock",
  emits: ["unlock"],
  setup(_, { emit }) {
    const seed = ref("");

    const { getInstance } = useRobonomics();

    const unlock = async () => {
      const robonomics = getInstance();

      try {
        await robonomics.accountManager.addUri(seed.value);
      } catch (error) {
        console.log(error);
        return;
      }
      console.log(robonomics.accountManager.account.address);

      emit("unlock");
    };

    return {
      seed,
      unlock
    };
  }
};
</script>
