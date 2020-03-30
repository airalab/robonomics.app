<template>
  <fragment>
    <template v-if="error">
      <ROverlay logo="assets/i/logo-dapp-2.svg" v-if="error == 1">
        <section class="msg-error msg-icon">
          <div class="msg-title">
            Dapp only works on the main network and sidechain
          </div>
          <p>
            <b>For work, you need to switch the network.</b>
          </p>
        </section>
      </ROverlay>
      <ROverlay logo="assets/i/logo-dapp-2.svg" v-else-if="error == 2">
        <section class="msg-error msg-icon">
          <div class="msg-title">Not found account</div>
        </section>
      </ROverlay>
      <ROverlay logo="assets/i/logo-dapp-2.svg" v-else-if="error == 3">
        <section class="msg-error msg-icon">
          <div class="msg-title">No access to account</div>
          <p v-if="isRequest">
            Try to refresh browser page or
            <button @click="requestAccount">request account</button>.
          </p>
        </section>
      </ROverlay>
      <ROverlay logo="assets/i/logo-dapp-2.svg" v-else>
        <section class="msg-error msg-icon">
          <div class="msg-title">Plugin required for application operation</div>
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
        </section>
      </ROverlay>
    </template>
    <template v-else-if="!isReady">
      <ROverlay logo="assets/i/logo-dapp-2.svg">
        <section>
          <div class="loader">
            <RLoader class="align-vertical m-r-15" />
            <b class="align-vertical t-style_uppercase">
              <span>Loading</span>
            </b>
          </div>
        </section>
      </ROverlay>
    </template>
    <Wrapp v-else :networkId="networkId" :account="account" :web3="getWeb3()">
      <router-view />
    </Wrapp>
  </fragment>
</template>

<script>
import { mapState } from "vuex";
import Wrapp from "./components/layout/Wrapp";
import config from "~config";

export default {
  components: {
    Wrapp
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
