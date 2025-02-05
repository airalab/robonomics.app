<template>
  <div v-if="twin">
    <twin-record
      v-for="(address, token) in twin"
      :key="token"
      :token="token"
      :address="address"
    />
  </div>
  <robo-status v-else type="warning">No entries</robo-status>
</template>

<script>
import { toRefs } from "vue";
import { tokenToCid, tokenToString, useTwin } from "../dtwin/dtwin";
import TwinRecord from "./TwinRecord.vue";

export default {
  props: ["id"],
  components: { TwinRecord },
  setup(props) {
    const { twin } = useTwin(toRefs(props).id);

    return {
      twin,
      tokenToCid,
      tokenToString
    };
  }
};
</script>
