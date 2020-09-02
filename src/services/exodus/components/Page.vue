<template>
  <Page>
    <RCard class="section-centered">
      <h2>Exodus</h2>
      <div class="item-avatar" style="margin-bottom: 20px;">
        <span
          class="item-avatar--image"
          :style="{ 'background-image': `url(${require('../banner.jpg')})` }"
        ></span>
      </div>
      <Exodus v-if="$robonomics.account" />
      <RButton v-else @click="$store.dispatch('chain/accessAccount', false)">
        Connect ethereum account
      </RButton>
    </RCard>
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
