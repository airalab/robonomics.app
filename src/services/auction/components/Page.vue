<template>
  <Page>
    <RCard class="section-centered">
      <h2>Robonomics Parachain CC1 Dutch Auction, October 2020</h2>
      <div class="item-avatar" style="margin-bottom: 20px">
        <span
          class="item-avatar--image"
          :style="{ 'background-image': `url(${require('../banner.jpg')})` }"
        ></span>
      </div>
      <Auction v-if="$robonomics.account" />
      <RButton v-else @click="$web3.initAccount()">
        Connect ethereum account
      </RButton>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import Auction from "./Auction";

export default {
  components: {
    Page,
    Auction
  }
};
</script>
