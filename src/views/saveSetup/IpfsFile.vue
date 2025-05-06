<template>
  <div class="block">
    <a :href="`https://ipfs.io/ipfs/${ipfsHash}`" target="_blank">
      {{ ipfsHash }}
    </a>
    <div><b>crust info</b>: {{ info }}</div>
    <div v-if="encrypt"><b>encrypt</b>: {{ encrypt }}</div>
    <div><b>data</b>: {{ content }}</div>
  </div>
</template>

<script>
import { useRobonomics } from "@/hooks/useRobonomics";
import { Crust } from "@/utils/crust";
import { u8aToString } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import axios from "axios";
import { hexToCid } from "robonomics-interface/dist/utils";
import { ref } from "vue";

export default {
  name: "IpfsFile",
  props: ["hex"],
  setup(props) {
    const encrypt = ref();
    const content = ref();
    const info = ref();
    const ipfsHash = hexToCid(props.hex);

    const { getInstance } = useRobonomics();
    const crust = new Crust("wss://rpc.crust.network");

    function omit(key, obj) {
      const { [key]: omitted, ...rest } = obj;
      return [rest, omitted];
    }

    crust.watch(async () => {
      const res = (await crust.getInfo(ipfsHash)).toHuman();
      if (res) {
        const o = omit("replicas", res);
        info.value = { ...o[0], replicas: Object.keys(o[1]).length };
      } else {
        info.value = "File is not pinned in crust network";
      }
    });

    const decrypt = (data) => {
      const robonomics = getInstance();
      const user = robonomics.accountManager.encryptor();
      const decryptedMessage = user.decryptMessage(
        data,
        decodeAddress(user.address)
      );
      return u8aToString(decryptedMessage);
    };
    const getContentFile = async () => {
      try {
        const res = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`);
        if (res.data.startsWith("0x")) {
          encrypt.value = res.data;
          content.value = decrypt(res.data);
        } else {
          encrypt.value = undefined;
          content.value = res.data;
        }
      } catch (error) {
        console.log(error);
      }
    };
    getContentFile();

    return {
      ipfsHash,
      info,
      encrypt,
      content
    };
  }
};
</script>

<style scoped>
.block {
  margin: 5px 0;
  padding: 5px;
  border: 1px solid #036ffc;
}
</style>
