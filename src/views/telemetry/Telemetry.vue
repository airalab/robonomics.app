<template>
  <div class="temp_toggler">
    <robo-button
      @click="type = 'launch'"
      :disabled="type === 'launch'"
      size="small"
    >
      Parachain
    </robo-button>
    <robo-button
      @click="type = 'libp2p'"
      :disabled="type === 'libp2p'"
      size="small"
    >
      Libp2p
    </robo-button>
  </div>
  <Libp2p v-if="type === 'libp2p'" :config="config" @error="error" />
  <Launch v-else :config="config" />
</template>

<script>
import { ref, watch } from "vue";
import Launch from "./Launch.vue";
import Libp2p from "./Libp2p.vue";
import { useConfig } from "./common";

export default {
  setup() {
    const type = ref(localStorage.getItem("typeTelemetry") || "launch");
    const { config } = useConfig();

    watch([config, type], () => {
      if (config.value && !config.value.peer_id && type.value === "libp2p") {
        console.log(`Error: not peer_id`);
        console.log(config.value);
        type.value = "launch";
      }
    });

    watch(type, () => {
      localStorage.setItem("typeTelemetry", type.value);
    });

    return {
      type,
      config,
      error: () => {
        type.value = "launch";
      }
    };
  },
  components: { Libp2p, Launch }
};
</script>

<style scoped>
.temp_toggler {
  position: absolute;
  top: calc(var(--robo-space) * 8);
  right: var(--robo-space);
  z-index: 10;
}
</style>
