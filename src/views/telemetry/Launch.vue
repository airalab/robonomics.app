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
import { useData } from "./launch";

export default {
  props: {
    config: Object
  },
  setup() {
    const { data, updateTime, run, launch } = useData();
    const store = useStore();

    run();

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
