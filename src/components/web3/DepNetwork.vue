<template>
  <div class="container-basic">
    <section class="t-align--center">
      <div class="loading-logo">
        <img alt="dApp logo" src="assets/i/logo-dapp-2.svg" style="width: 150px;">
      </div>
      <div class="loading-title title-pale">robonomics.network</div>
    </section>
    <div class="msg-error msg-icon">
      <div class="msg-title">Dapp only works on the main network</div>
      <p>
        <b>For work, you need to switch the network.</b>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "DepNetwork"
};
</script>
