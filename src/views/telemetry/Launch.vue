<template>
  <robo-smarthome-dashboard
    :config="config"
    :datalog="data"
    :cid="cid"
    :updateTime="updateTime"
  />

  <!-- {{data}}, {{dataTest}} -->
</template>

<script>
import { watch } from "vue";
import { useStore } from "vuex";
import { useData } from "./launch";

// это для тестов верстки карточек, когда все остальные тестовые стенды отвалились
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
    const { data, updateTime, run, launch, cid } = useData();
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

    return { data, updateTime, cid, dataTest, configTest };
  }
};
</script>
