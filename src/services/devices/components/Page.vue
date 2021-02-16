<template>
  <Page>
    <router-view></router-view>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import { getInstance } from "../../../utils/substrate";

export default {
  components: {
    Page
  },
  async created() {
    await getInstance();
  }
};
</script>
