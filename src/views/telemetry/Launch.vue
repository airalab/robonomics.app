<template>
  <robo-smarthome-dashboard
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
    isKey: {
      default: false,
      type: Boolean
    },
    config: {
      default: null,
      type: Object
    }
  },
  setup(props) {
    const { data, updateTime, run, launch } = useData();
    const store = useStore();

    watch(
      () => props.isKey,
      (value) => {
        if (value) {
          run();
        }
      },
      { immediate: true }
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
