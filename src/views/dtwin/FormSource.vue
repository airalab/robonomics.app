<template>
  <robo-section offset="x05">
    <robo-grid offset="x0" gap="x05" columns="1">
      <robo-text title="3" offset="x0">Add source</robo-text>
      <robo-input v-model="topic" label="Topic" block />
      <robo-input v-model="source" label="Source" block />
      <robo-button
        @click="setSource"
        block
        :disabled="isProccess"
        :loading="isProccess"
        :type="isSuccess ? 'ok' : 'primary'"
      >
        Save
      </robo-button>
    </robo-grid>
  </robo-section>
</template>

<script>
import { useSend } from "robonomics-interface-vue/account";
import { useAction } from "robonomics-interface-vue/twin";
import { ref } from "vue";

export function stringToHex(str) {
  const strBuf = Buffer.from(str.toString(), "utf-8");
  if (strBuf.length > 32) {
    throw new Error("max 32");
  }
  const bag = Buffer.alloc(32);
  const fill = Buffer.concat([bag, strBuf]);
  const buf = Buffer.from(fill).slice(fill.length - 32, fill.length);
  return "0x" + buf.toString("hex");
}

export default {
  props: ["id", "owner"],
  setup(props, { emit }) {
    const action = useAction();
    const { tx } = useSend();

    const topic = ref();
    const source = ref();
    const isProccess = ref(false);
    const isSuccess = ref(false);

    return {
      topic,
      source,
      isProccess,
      isSuccess,
      setSource: async () => {
        isSuccess.value = false;
        isProccess.value = true;
        await tx.send(
          () =>
            action.setSource(props.id, stringToHex(topic.value), source.value),
          { subscription: props.owner }
        );
        if (tx.error.value) {
          if (tx.error.value !== "Cancelled") {
            console.log(tx.error.value);
          } else {
            console.log("cancel");
          }
          isProccess.value = false;
          return false;
        }
        isProccess.value = false;
        isSuccess.value = true;
        emit("create");
      }
    };
  }
};
</script>
