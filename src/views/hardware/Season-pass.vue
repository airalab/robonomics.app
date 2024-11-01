<template>
  <robo-layout-section>
    Season pass
    <hr />
    {{ store.state.robonomicsUIvue.ethereum.activeAccount }}
    <div>
      <div v-if="$web3.state.isReady">
        <nft-info v-if="$web3.state.account" />
        <div v-else>Not found account</div>
      </div>
      <div v-else>...</div>
      <div v-if="$web3.state.error">
        {{ $web3.state.error }}
      </div>
    </div>
  </robo-layout-section>
</template>

<script setup>
import NftInfo from "@/components/web3/NftInfo.vue";
import { $web3 } from "@/plugins/web3";
import { watch } from "vue";
import { useStore } from "vuex";

const store = useStore();

const providers = [];
const handler = (event) => providers.push(event.detail);

watch(
  () => store.state.robonomicsUIvue.ethereum.activeProviderUuid,
  async (value) => {
    const index = providers.findIndex((item) => {
      if (item.info.uuid === value) {
        return true;
      }
      return false;
    });
    if (index >= 0) {
      try {
        await $web3.setProvider(providers[index].provider);
      } catch (error) {
        console.log(error);
      }
    }
  }
);

watch(
  () => store.state.robonomicsUIvue.ethereum.activeAccount,
  async () => {
    await $web3.setSigner();
  }
);

window.addEventListener("eip6963:announceProvider", handler);
window.dispatchEvent(new CustomEvent("eip6963:requestProvider"));
</script>
