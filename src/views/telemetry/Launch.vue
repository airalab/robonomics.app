<template>
  <robo-smarthome-dashboard
    :config="config"
    :datalog="data"
    :updateTime="updateTime"
  />

  <!-- {{data}}, {{dataTest}} -->
</template>

<script>
import { watch } from "vue";
import { useStore } from "vuex";
import { useData } from "./launch";

import dataTest from "./Lugano.json"
import configTest from "./Lugano-config.json"

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

    return { data, updateTime, dataTest, configTest };
  }
};
</script>
