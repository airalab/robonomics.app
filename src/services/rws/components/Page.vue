<template>
  <Page>
    <RCard class="section-centered">
      <template v-if="isApi">
        <router-view></router-view>
      </template>
      <template v-else>
        <div v-if="error" class="red">{{ error }}</div>
        <div v-else>...</div>
      </template>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import { getInstance } from "@/utils/substrate";
import config from "../config";

export default {
  components: {
    Page
  },
  data() {
    return {
      error: null,
      isApi: false
    };
  },
  async created() {
    try {
      await getInstance(config.CHAIN);
      this.isApi = true;
    } catch (error) {
      this.error = error.message;
    }
  }
};
</script>
