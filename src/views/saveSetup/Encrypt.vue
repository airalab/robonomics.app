<template>
  <div>
    <robo-input v-model="data" />
    <robo-button @click="encrypt">encrypt</robo-button>
  </div>
</template>

<script>
import { useRobonomics } from "@/hooks/useRobonomics";
import { u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { ref } from "vue";

export default {
  name: "EncryptMessage",
  emits: ["encrypt"],
  setup(_, { emit }) {
    const data = ref('{"name":"blushing cow"}');

    const { getInstance } = useRobonomics();

    const encrypt = () => {
      const robonomics = getInstance();
      const user = robonomics.accountManager.encryptor();
      const encryptedMessage = user.encryptMessage(
        data.value,
        decodeAddress(user.address)
      );
      const dataHex = u8aToHex(encryptedMessage);
      emit("encrypt", dataHex);
    };

    return {
      data,
      encrypt
    };
  }
};
</script>
