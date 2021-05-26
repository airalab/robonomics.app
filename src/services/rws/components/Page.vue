<template>
  <Page>
    <RCard class="section-centered">
      <h2>Robonomics Web Services dashboard</h2>
      <router-view v-if="$robonomics.account && isApi"></router-view>
      <RButton v-else @click="$store.dispatch('chain/accessAccount', false)">
        Connect ethereum account
      </RButton>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import { getInstance } from "../../../utils/substrate";

export default {
  components: {
    Page
  },
  data() {
    return {
      isApi: false
    };
  },
  async created() {
    await getInstance();
    this.isApi = true;
  }
};
</script>
