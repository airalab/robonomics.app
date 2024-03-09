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

    if (props.config.peer_id) {
      (async () => {
        const result = await run(props.config.peer_id);
        if (!result) {
          emit("error");
        }
      })();
    } else {
      console.log(`Error: not peer_id`);
      console.log(props.config);
    }

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
