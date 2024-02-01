<template>
  <robo-layout-section>
    <robo-template-rws-setup create :onRwsUpdate="onSave" />
  </robo-layout-section>
</template>

<script>
import { Keyring } from "@polkadot/api";
import { encodeAddress } from "@polkadot/util-crypto";

export default {
  setup() {
    let onSave = (rws, setStatus) => {
      if (!rws.owner || !rws.name || !rws.controller || !rws.scontroller) {
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

      const k = new Keyring();
      const accountController = k.addFromUri(rws.scontroller, {}, "ed25519");

      if (encodeAddress(rws.controller) !== accountController.address) {
        setStatus("error", "Bad seed or type not ed25519");
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
