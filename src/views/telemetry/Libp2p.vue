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
  emits: ["connected", "error"],
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
              if (result) {
                emit("connected", result);
                if (!result.protoNames().includes("p2p-circuit")) {
                  const gateway = `http://${
                    result.nodeAddress().address
                  }:8080/ipfs/`;
                  if (
                    store.state.robonomicsUIvue.ipfs.activegateway !== gateway
                  ) {
                    console.log("set local gateway", gateway);
                    store.commit("ipfs/setActiveGateway", gateway);
                  }
                } else {
                  console.log("relay");
                }
              } else {
                emit("error", new Error("connect"));
              }
            })();
          } else {
            emit("error", new Error("not found peer_id"));
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
