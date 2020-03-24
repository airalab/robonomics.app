<template>
  <fragment>
    <template v-if="error">
      <RErrorDepNetwork v-if="error==1" />
      <RErrorNotAccounts v-else-if="error==2" />
      <RErrorNotAccess @requestAccount="requestAccount" v-else-if="error==3" />
      <RErrorNotWeb3 v-else />
    </template>
    <template v-else-if="!isReady">
      <ROverlayLoader />
    </template>
    <RApp v-else :networkId="networkId" :account="account" :web3="getWeb3()">
      <router-view />
    </RApp>
  </fragment>
</template>

<script>
import { mapState } from "vuex";
import config from "~config";

export default {
  computed: {
    ...mapState("chain", [
      "error",
      "isReady",
      "networkId",
      "account",
      "getWeb3"
    ])
  },
  watch: {
    networkId(networkId, old) {
      if (old !== null && networkId !== old) {
        window.location.reload(false);
      }
    }
  },
  created() {
    this.$store.dispatch("chain/init", config.chain.getListId());
  },
  methods: {
    requestAccount() {
      this.$store.dispatch("chain/accessAccount");
    }
  }
};
</script>
