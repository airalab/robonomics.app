<template>
  <fragment>
    <template v-if="error">
      <Loader v-if="error == 1">
        <p>
          <b>For work, you need to switch the network.</b>
        </p>
      </Loader>
      <Loader v-else-if="error == 2">
        <p>Not found account</p>
      </Loader>
      <Loader v-else-if="error == 3">
        <div>
          <p>No access to account</p>
          <p v-if="isRequest">
            Try to refresh browser page or
            <button @click="requestAccount">request account</button>.
          </p>
        </div>
      </Loader>
      <Loader v-else>
        <p>
          <b>
            Please, setup:
            <a
              class="t-style_uppercase"
              href="https://metamask.io/"
              target="_blank"
              >Metamask</a
            >
          </b>
        </p>
      </Loader>
    </template>
    <template v-else-if="!isReady">
      <Loader />
    </template>
    <Wrapp v-else :networkId="networkId" :account="account" :web3="getWeb3()">
      <router-view />
    </Wrapp>
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
