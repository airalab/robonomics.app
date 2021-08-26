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
import { Robonomics } from "@/utils/robonomics-substrate";
import { createInstance } from "@/utils/substrate";

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
      Robonomics.getInstance();
      this.ready = true;
    } catch (_) {
      try {
        this.robonomics = await createInstance();
        this.ready = true;
      } catch (error) {
        this.error = error.message;
      }
    }
  }
};
</script>
