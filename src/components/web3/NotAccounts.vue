<template>
  <div class="container-basic">
    <section class="loading-container">
      <div class="loading-logo">
        <img alt="dApp logo" src="assets/i/logo-dapp-2.svg" style="width: 150px;" />
      </div>
      <div class="t-uppercase t-lg tcolor-violet">robonomics.network</div>
      <section class="msg-error msg-icon">
        <div class="msg-title">No access to account</div>
        <p>
          Try to refresh browser page or
          <button @click="requestAccount">request account</button>.
        </p>
      </section>
    </section>
  </div>
</template>

<script>
import Web3Check from "vue-web3-check";

export default {
  name: "NotAccounts",
  methods: {
    requestAccount() {
      Web3Check.access();
    }
  }
};
</script>
