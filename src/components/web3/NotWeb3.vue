<template>
  <div class="container-basic">
    <section class="loading-container">
      <div class="loading-logo">
        <img alt="dApp logo" src="assets/i/logo-dapp-2.svg" style="width: 150px;" />
      </div>
      <div class="t-uppercase t-lg tcolor-violet">robonomics.network</div>
      <section class="msg-error msg-icon">
        <div class="msg-title">Plugin required for application operation</div>
        <p>
          <b>
            Please, setup:
            <a class="t-style_uppercase" href="https://metamask.io/" target="_blank">Metamask</a>
          </b>
        </p>
      </section>
    </section>
  </div>
</template>

<script>
export default {
  name: "NotWeb3"
};
</script>
