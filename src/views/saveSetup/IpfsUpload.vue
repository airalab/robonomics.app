<template>
  <div>
    Encrypted content:
    <small>{{ data }}</small>
    <robo-input v-model="ipfsGateway" />
    <robo-button @click="upload">upload</robo-button>
  </div>
</template>

<script>
import { useRobonomics } from "@/hooks/useRobonomics";
import { stringToU8a } from "@polkadot/util";
import { ref } from "vue";
import { IpfsApiClient } from "../../plugins/ipfs";

export default {
  name: "IpfsUpload",
  props: ["data"],
  emits: ["upload"],
  setup(props, { emit }) {
    const ipfsGateway = ref("https://ipfs-gw.decloud.foundation");

    const { getInstance } = useRobonomics();

    const upload = async () => {
      const ipfs = new IpfsApiClient(ipfsGateway.value);

      const robonomics = getInstance();

      try {
        const signature = (
          await robonomics.accountManager.account.signMsg(
            stringToU8a(robonomics.accountManager.account.address)
          )
        ).toString();
        ipfs.auth(null, robonomics.accountManager.account.address, signature);
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
