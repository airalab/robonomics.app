<template>
  <Page>
    <RCard class="section-centered">
      <h2>Robonomics Web Services dashboard</h2>
      <blockquote>
        <a
          href="https://blog.aira.life/robonomics-web-services-and-rws-token-intro-d730ab50ad42"
          target="_blank"
          >Robonomics Web Services and RWS token intro</a
        >
      </blockquote>

      <h3>Metrics</h3>

      <template v-if="$robonomics.account">
        <Subscribe />
      </template>
      <template v-else>
        <div class="row">
          <div
            class="col-md-6"
            style="text-align: center; font-size: 20px; font-weight: bold;"
          >
            ? tps
          </div>
          <div
            class="col-md-6"
            style="text-align: center; font-size: 20px; font-weight: bold;"
          >
            ? RWS tokens
          </div>
        </div>
        <br />
        <RButton @click="$store.dispatch('chain/accessAccount', false)"
          >Connect ethereum account</RButton
        >
      </template>

      <h3>How to get RWS tokens?</h3>
      <div class="row">
        <div class="col-md-6">
          <a
            href="https://uniswap.info/pair/0x42018a2ff89b6d662b5f746277bd02f0d85f485a"
            target="_blank"
            >Swap on Uniswap</a
          >
          <br />(ETH, DAI, XRT)
        </div>
        <div class="col-md-6">
          <a
            href="https://gist.github.com/ensrationis/da6824310ef9ad7ec1f00e41418070d4"
            target="_blank"
            >Academia or NGO employee?</a
          >
          <br />(email associated with organization domain required)
        </div>
      </div>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import Subscribe from "./Subscribe";

export default {
  components: {
    Page,
    Subscribe
  }
};
</script>
