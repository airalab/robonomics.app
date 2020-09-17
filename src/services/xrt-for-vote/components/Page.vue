<template>
  <Page>
    <RCard class="section-light section-centered">
      <h2>XRT for DAO votes</h2>
      <a
        href="https://client.aragon.org/#/dao.robonomics.eth"
        target="_blank"
        class="item-avatar"
        style="margin-bottom: 20px;"
      >
        <span
          class="item-avatar--image"
          :style="{ 'background-image': `url(${require('../banner.jpg')})` }"
        ></span>
      </a>
      <Exchange v-if="$robonomics.account" />
      <p v-else class="t-align--center">
        <RButton @click="$store.dispatch('chain/accessAccount', false)">
          Connect ethereum account
        </RButton>
      </p>
      <blockquote
        class="t-align--center"
        style="font-weight: 400; border-color: #222222; opacity: 0.8;"
      >
        After XRT to DAO VOTES convertation you can
        <a
          href="https://client.aragon.org/#/dao.robonomics.eth"
          target="_blank"
        >
          make proposals via Aragon</a
        >.<br />
        Watch
        <a href="https://youtu.be/BviLcxTE0rQ" target="_blank">
          demo video on YouTube</a
        >.<br />
        In case you missed,
        <a
          href="https://blog.aira.life/square-root-of-xrt-voters-dao-on-aragon-simple-quadratic-voting-system-for-our-community-edc301522406"
          target="_blank"
        >
          what for these votes </a
        >.
      </blockquote>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import Exchange from "./Exchange";

export default {
  components: {
    Page,
    Exchange
  }
};
</script>
