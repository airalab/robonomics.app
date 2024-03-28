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
    config: Object
  },
  emits: ["error"],
  setup(props, { emit }) {
    const { data, updateTime, run, launch } = useData();

    watch(
      () => ({ ...props.config }),
      (newValue, oldValue) => {
        if (newValue && newValue.peer_id) {
          if (
            !oldValue ||
            (oldValue.peer_id && newValue.peer_id !== oldValue.peer_id)
          ) {
            (async () => {
              const result = await run(
                newValue.peer_id,
                newValue.local_libp2p_multiaddress
              );
              if (!result) {
                emit("error");
              }
            })();
          }
        } else {
          console.log(`Error: not peer_id`);
          console.log(props.config);
          emit("error");
        }
      },
      { immediate: true }
    );

    const store = useStore();

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
