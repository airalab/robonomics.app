<template>
  <div>
    Encrypted content:
    <small>{{ data }}</small>
    <robo-input v-model="ipfsGateway" />
    <robo-button @click="upload">upload</robo-button>
  </div>
</template>

<script>
import { stringToU8a } from "@polkadot/util";
import { useAccount } from "robonomics-interface-vue/account";
import { ref } from "vue";
import { useAccounts } from "../../hooks/useAccounts";
import { IpfsApiClient } from "../../plugins/ipfs";

export default {
  name: "IpfsUpload",
  props: ["data"],
  emits: ["upload"],
  setup(props, { emit }) {
    const ipfsGateway = ref("https://ipfs-gw.decloud.foundation");

    const { account } = useAccount();
    const { signMsg } = useAccounts();

    const upload = async () => {
      const ipfs = new IpfsApiClient(ipfsGateway.value);
      try {
        const signature = signMsg(stringToU8a(account.value));
        ipfs.auth(null, account.value, signature);
        const file = await ipfs.add(props.data);

        emit("upload", {
          path: file.path,
          size: file.size
        });
      } catch (error) {
        console.log(error);
      }
    };

    return {
      ipfsGateway,
      upload
    };
  }
};
</script>
