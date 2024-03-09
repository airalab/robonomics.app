<template>
  <div style="text-align: right">
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
  <template v-if="config">
    <Libp2p v-if="type === 'libp2p'" :config="config" @error="error" />
    <Launch v-else :config="config" />
  </template>
  <robo-layout-section v-else>
    <robo-layout-section gcenter>
      <robo-loader size="2" />
    </robo-layout-section>
  </robo-layout-section>
</template>

<script>
import { ref, watch } from "vue";
import Launch from "./Launch.vue";
import Libp2p from "./Libp2p.vue";
import { useConfig } from "./common";

export default {
  setup() {
    const type = ref("launch");
    const { config } = useConfig();

    watch([config, type], () => {
      if (config.value && !config.value.peer_id && type.value === "libp2p") {
        console.log(`Error: not peer_id`);
        console.log(config.value);
        type.value = "launch";
      }
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
