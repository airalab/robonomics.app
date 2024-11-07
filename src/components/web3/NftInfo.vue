<template>
  <div>
    <div>balance: {{ balance }} NFT</div>
    <nft-token
      v-for="token in tokens"
      :key="token.tokenId"
      :token="token"
      @activate="loadTokens"
      class="card"
    />
  </div>
</template>

<script>
import { address } from "@/config";
import { $web3 } from "@/plugins/web3";
import axios from "axios";
import { ethers } from "ethers";
import { ref, watch } from "vue";
import nft_abi from "./abi/NFT.json";
import NftToken from "./NftToken.vue";

export default {
  components: { NftToken },
  setup() {
    const balance = ref(null);
    const tokens = ref([]);

    // NFT
    const nftContract = new ethers.Contract(
      address.nft,
      nft_abi,
      $web3.provider
    );

    (async () => {
      try {
        console.log('$web3.state.account', $web3.state.account)
        balance.value = await nftContract.balanceOf($web3.state.account);
      } catch (error) {
        console.log(error);
      }
    })();

    watch(
      () => $web3.state.block,
      async () => {
        try {
          console.log('$web3.state.account', $web3.state.account)
          balance.value = await nftContract.balanceOf($web3.state.account);
        } catch (error) {
          console.log(error);
        }
      }
    );

    const loadTokens = async () => {
      if (!balance.value) {
        return;
      }
      const ids = [];
      for (let index = 0; index < balance.value; index++) {
        try {
          const tokenId = await nftContract.tokenOfOwnerByIndex(
            $web3.state.account,
            index
          );
          const uri = await nftContract.tokenURI(tokenId);
          const ipfsHash = uri.split("ipfs://").pop();

          const res = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`);

          ids.push({
            activated: await nftContract.activatedOf(tokenId),
            tokenId: tokenId.toString(),
            name: `${res.data.name} #${tokenId.toString()}`,
            image: res.data.image.split("ipfs://").pop()
          });
        } catch (error) {
          console.log(error);
        }
        ``;
      }
      tokens.value = ids;
    };

    watch(balance, loadTokens);

    return {
      balance,
      tokens,
      loadTokens
    };
  }
};
</script>
