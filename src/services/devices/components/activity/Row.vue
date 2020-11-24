<template>
  <div class="item">
    <code class="data">{{ value.data }}</code>
    <Share class="share" :addr="addr" :value="value" />
  </div>
</template>

<script>
import Share from "./Share";

export default {
  props: ["addr", "value"],
  components: {
    Share
  }
};
</script>

<style scoped>
.item {
  border: 1px solid #eee;
}
.data {
  padding: 10px;
  font-size: 12px;
  display: block;
}
.share {
  margin: 5px;
}
</style>
