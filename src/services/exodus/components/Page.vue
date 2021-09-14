<template>
  <Page>
    <section class="grid-1-3 layout-wide">
      <div class="hyphens">
        <h1>Exodus</h1>
        <img :src="require('../assets/exodus-banner-3.png')" />
        <p>
          Here you may input your details in order to transfer your ERC-20 XRT
          to the Robonomics parachain. Periodically, the network technical
          committee will transfer XRT tokens from the Ethereum network to the
          Frontier network, this will happen once a sufficient number of
          applicants has been reached.
        </p>
        <p>
          <b class="strong">Who's it for:</b> People who hold XRT tokens on the
          Ethereum network and are planning to participate in staking on the
          Robonomics parachain.
        </p>
        <a
          class="btn-outline"
          href="https://github.com/airalab/robonomics/issues"
          target="_blank"
          rel="noopener"
          >Troubleshooting</a
        >
      </div>

      <Exodus />
    </section>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import Exodus from "./Exodus";

export default {
  components: {
    Page,
    Exodus
  }
};
</script>
