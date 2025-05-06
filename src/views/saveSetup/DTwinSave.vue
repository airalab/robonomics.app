<template>
  <div>
    <robo-button @click="save">save to digital twin</robo-button>
  </div>
</template>

<script>
import { useTwinAction } from "../dtwin/dtwin";

export default {
  props: ["twinId", "owner", "address", "data"],
  emits: ["save"],
  setup(props, { emit }) {
    const { setSource } = useTwinAction(props.owner);

    const save = async () => {
      const tx = await setSource(props.twinId, props.data, props.address);
      if (tx.error.value) {
        if (tx.error.value !== "Cancelled") {
          console.log(tx.error.value);
        } else {
          console.log("cancel");
        }
        return false;
      }
      emit("save");
    };

    return {
      save
    };
  }
};
</script>
