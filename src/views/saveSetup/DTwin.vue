<template>
  <div>
    <select-twin @change="(r) => (twinId = r)" :key="keySelect" />
    <create-twin :owner="owner" @create="keySelect++" />
  </div>
</template>

<script>
import { ref, watch } from "vue";
import CreateTwin from "../dtwin/CreateTwin.vue";
import SelectTwin from "../dtwin/SelectTwin.vue";
import { useTwin } from "../dtwin/dtwin";

export default {
  props: ["address", "owner", "data"],
  emits: ["twinId", "find"],
  components: { SelectTwin, CreateTwin },
  setup(props, { emit }) {
    const twinId = ref();
    const keySelect = ref(0);
    const keyRecords = ref(0);
    const { twin } = useTwin(twinId);

    watch(twinId, (twinId) => {
      emit("twinId", twinId);
    });

    watch(twin, (twin) => {
      if (twin) {
        const list = [];
        for (const key in twin) {
          if (twin[key] === props.address) {
            list.push(key);
          }
        }
        emit("find", list);
      }
    });

    return {
      twinId,
      keySelect,
      keyRecords
    };
  }
};
</script>
