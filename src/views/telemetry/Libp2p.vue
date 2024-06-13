<template>
  <robo-template-devices-layout
    :config="config"
    :datalog="data"
    :updateTime="updateTime"
  />
</template>

<script>
import { watch } from "vue";
import { useStore } from "vuex";
import { useData } from "./libp2p";

export default {
  props: {
    isKey: {
      default: false,
      type: Boolean
    },
    config: {
      default: null,
      type: Object
    }
  },
  emits: ["error"],
  setup(props, { emit }) {
    const { data, updateTime, run, launch } = useData();
    const store = useStore();

    const isOnce = props.isKey && props.config !== null;
    const stop = watch(
      () => [props.isKey, props.config],
      ([isKey, config]) => {
        if (isKey && config !== null) {
          if (!isOnce && typeof stop === "function") {
            stop();
          }
          if (config.peer_id) {
            (async () => {
              const result = await run(
                config.peer_id,
                config.libp2p_multiaddress
              );
              if (!result) {
                emit("error");
              }
            })();
          }
        }
      },
      { immediate: true, once: isOnce }
    );

    watch(
      () => store.state.robonomicsUIvue.rws.launch,
      (value) => {
        try {
          launch(JSON.parse(value));
        } catch (error) {
          console.log(error);
        }
      }
    );

    return { data, updateTime };
  }
};
</script>
