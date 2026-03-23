<template>
  <div>
    <robo-button @click="save">save to digital twin</robo-button>
  </div>
</template>

<script>
import { logger } from "@/utils/logger";
import { useSend } from "robonomics-interface-vue/account";
import { useAction } from "robonomics-interface-vue/twin";

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
  props: ["twinId", "owner", "address", "data"],
  emits: ["save"],
  setup(props, { emit }) {
    const action = useAction();
    const { tx } = useSend();

    const save = async () => {
      await tx.send(
        () =>
          action.setSource(
            props.twinId,
            stringToHex(props.data),
            props.address
          ),
        { subscription: props.owner }
      );
      if (tx.error.value) {
        if (tx.error.value !== "Cancelled") {
          logger.error(tx.error.value);
        } else {
          logger.log("cancel");
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
