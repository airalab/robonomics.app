<template>
  <fragment>
    <template v-if="!isReady && !error"><Loader /></template>
    <Wrapp
      v-else
      :networkId="networkId"
      :account="account"
      :web3="$web3.library"
    >
      <router-view />
    </Wrapp>
    <modals-container />
    <notifications />
  </fragment>
</template>

<script>
import Wrapp from "./components/layout/Wrapp";
import Loader from "./components/layout/Loader";
import config from "~config";

export default {
  components: {
    Wrapp,
    Loader
  },
  computed: {
    isReady: function () {
      return this.$web3.isReady();
    },
    error: function () {
      return this.$web3.error();
    },
    account: function () {
      return this.$web3.account();
    },
    networkId: function () {
      return this.$web3.networkId();
    }
  },
  watch: {
    networkId(networkId, old) {
      if (old !== null && networkId !== old) {
        window.location.reload(false);
      }
    }
  },
  created() {
    this.$web3.init({
      networks: config.chain.getListId().map((item) => Number(item)),
      infura: {
        networkId: 1,
        key: config.INFURA_KEY
      }
    });
  }
};
</script>
