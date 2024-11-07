<template>
  <div>
    {{ token.name }}<br />
    <img :src="`https://ipfs.io/ipfs/${token.image}`" style="width: 200px" />
    <br />
    <btn-send
      v-if="!token.activated"
      @click="(wait) => activate(wait, token.tokenId)"
    >
      Activate
    </btn-send>
    <span v-else>activated</span>

    <free-minimum :token="token.tokenId" />
  </div>
</template>

<script>
import { address } from "@/config";
import { $web3 } from "@/plugins/web3";
import { ethers } from "ethers";
import nft_abi from "./abi/NFT.json";
import BtnSend from "./BtnSend.vue";
import FreeMinimum from "./FreeMinimum.vue";

export default {
  props: ["token"],
  emits: ["activate"],
  components: { BtnSend, FreeMinimum },
  setup(_, { emit }) {
    const activate = async (wait, tokenId) => {
      const nftContract = new ethers.Contract(
        address.nft,
        nft_abi,
        $web3.provider
      );

      try {
        const tx = await nftContract.connect($web3.signer).activate(tokenId);
        await wait(tx);
        emit("activate", tokenId);
      } catch (error) {
        if (error.code === "CALL_EXCEPTION" && error.data) {
          await wait(null, nftContract.interface.parseError(error.data).name);
        } else {
          await wait(null, error);
        }
      }
    };

    return {
      activate
    };
  }
};
</script>
