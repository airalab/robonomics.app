<template>
  <robo-layout-section rwsrecover>
    <robo-template-rws-user-setup
      v-model:address="addressNew"
      v-model:name="nameNew"
      @on-user-setup="onSetup"
    />
  </robo-layout-section>
</template>

<script>
import { useDevices } from "@/hooks/useDevices";
import { useRobonomics } from "@/hooks/useRobonomics";
import { useSend } from "@/hooks/useSend";
import { ref, watch } from "vue";
import { useStore } from "vuex";

export default {
  setup() {
    let addressNew = ref(null);
    let nameNew = ref(null);
    const store = useStore();
    let owner = ref(store.state.robonomicsUIvue.rws.active);

    watch(
      () => store.state.robonomicsUIvue.rws.active,
      () => {
        owner.value = store.state.robonomicsUIvue.rws.active;
      }
    );

    const robonomics = useRobonomics();
    const tx = useSend();
    const devices = useDevices(owner);

    const onSetup = async (setStatus) => {
      if (!devices.devices.value.includes(addressNew.value)) {
        const call = await robonomics.rws.setDevices([
          ...devices.devices.value,
          addressNew.value
        ]);
        await tx.send(call);
        if (tx.error.value) {
          if (tx.error.value !== "Cancelled") {
            setStatus("error", tx.error.value);
          } else {
            setStatus("calcel");
          }
          return;
        }
      }
      setStatus("ok");
    };

    return {
      addressNew,
      nameNew,
      onSetup
    };
  }
};
</script>
