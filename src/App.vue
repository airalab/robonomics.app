<template>
  <fragment>
    <template v-if="!isReady && !error"><Loader /></template>
    <Wrapp v-else :networkId="networkId" :account="account" :web3="getWeb3()">
      <router-view />
    </Wrapp>
    <modals-container />
    <notifications />
  </fragment>
</template>

<script>
import { mapState } from "vuex";
import Wrapp from "./components/layout/Wrapp";
import Loader from "./components/layout/Loader";
import config from "~config";

export default {
  components: {
    Wrapp,
    Loader
  },
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
