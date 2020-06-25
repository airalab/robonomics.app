<template>
  <Page>
    <RCard class="section-centered">
      <h2>Robonomics subscribe</h2>
      <Subscribe v-if="$robonomics.account" />
      <section v-else>Account not connected</section>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import Subscribe from "./Subscribe";

export default {
  components: {
    Page,
    Subscribe
  }
};
</script>
