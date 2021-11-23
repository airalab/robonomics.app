<template>
  <Page>
    <RCard class="section-centered">
      <div class="item-avatar" style="margin-bottom: 20px">
        <span
          class="item-avatar--image"
          :style="{ 'background-image': `url(${require('../banner.jpg')})` }"
        ></span>
      </div>

      <div v-if="$robonomics.account">
        <Vesting :address="address" />
      </div>
      <RButton v-else @click="$web3.initAccount()">
        Connect ethereum account
      </RButton>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import Vesting from "./Vesting";
import config from "../config";

export default {
  components: {
    Page,
    Vesting
  },
  data() {
    return {
      address: config.GRANTS
    };
  }
};
</script>
