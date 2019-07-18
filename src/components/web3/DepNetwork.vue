<template>
  <div class="container-basic">
    <section class="loading-container">
      <div class="loading-logo">
        <img alt="dApp logo" src="assets/i/logo-dapp-2.svg" style="width: 150px;" />
      </div>
      <div class="t-uppercase t-lg tcolor-violet">robonomics.network</div>
      <section class="msg-error msg-icon">
        <div class="msg-title">Dapp only works on the main network and sidechain</div>
        <p>
          <b>For work, you need to switch the network.</b>
        </p>
      </section>
    </section>
  </div>
</template>

<script>
export default {
  name: "DepNetwork"
};
</script>
