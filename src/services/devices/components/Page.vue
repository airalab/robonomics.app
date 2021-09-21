<template>
  <Page>
    <router-view v-if="ready"></router-view>
    <template v-else>
      <div v-if="error" class="red">{{ error }}</div>
      <div v-else>...</div>
    </template>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import { getInstance } from "@/utils/substrate";

export default {
  components: {
    Page
  },
  data() {
    return {
      ready: false,
      error: false
    };
  },
  async created() {
    try {
      await getInstance("robonomics", false);
      this.ready = true;
    } catch (error) {
      this.error = error.message;
    }
  }
};
</script>
