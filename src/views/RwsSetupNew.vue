<template>
  <robo-layout-section>
    <robo-template-rws-setup create :onRwsUpdate="onSave" />
  </robo-layout-section>
</template>

<script>
import { encodeAddress } from "@polkadot/util-crypto";

export default {
  setup() {
    let onSave = (rws, setStatus) => {
      if (!rws.owner || !rws.name || !rws.controller) {
        setStatus("error", "All fields are required");
        return;
      }

      try {
        encodeAddress(rws.owner);
      } catch (error) {
        setStatus("error", `Owner: ${error.message}`);
        return;
      }
      try {
        encodeAddress(rws.controller);
      } catch (error) {
        setStatus("error", `Controller: ${error.message}`);
        return;
      }

      setStatus("ok");
    };
    return {
      onSave
    };
  }
};
</script>
