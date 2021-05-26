<template>
  <Page>
    <router-view v-if="ready"></router-view>
    <div v-else>...</div>
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
      ready: false
    };
  },
  async created() {
    await getInstance();
    this.ready = true;
  }
};
</script>
