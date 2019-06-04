<template>
  <div class="container-basic">
    <section class="t-align--center">
      <div class="loading-logo">
        <img alt="dApp logo" src="assets/i/logo-dapp-2.svg" style="width: 150px;">
      </div>
      <div class="loading-title title-pale">robonomics.network</div>
    </section>
    <div class="msg-error msg-icon">
      <div class="msg-title">No access to account</div>
      <p>
        <b>
          Try to refresh browser page or
          <button @click="requestAccount">request account</button>.
        </b>
      </p>
    </div>
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
