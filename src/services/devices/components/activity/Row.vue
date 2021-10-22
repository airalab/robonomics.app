<template>
  <div class="item">
    <code class="data">{{ value.data }}</code>
  </div>
</template>

<script>
export default {
  props: ["addr", "value"]
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
</style>
