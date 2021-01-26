<template>
  <Page>
    <iframe src="https://sensors.robonomics.network/" class="map" />
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";

export default {
  components: {
    Page
  }
};
</script>

<style scoped>
.map {
  width: calc(100vw - 216px);
  height: calc(100vh - 87px);
  border: 0;
  z-index: 10;
  position: relative;
  margin: -40px;
}
</style>
