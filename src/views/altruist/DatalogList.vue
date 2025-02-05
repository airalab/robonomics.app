<template>
  <div class="datalog-list">
    <div
      class="datalog-item"
      v-for="(item, key) in log.slice().reverse()"
      :key="key"
    >
      <span class="time">{{ new Date(item.moment).toLocaleTimeString() }}</span>
      <code>{{ item.raw }}</code>
    </div>
  </div>
</template>

<script>
export default {
  props: ["log", "isLaoded"]
};
</script>

<style scoped>
.datalog-list {
  overflow-y: scroll;
  height: 500px;
  border: 1px solid var(--robo-color-text);
  padding: 10px;
  background-color: #fff;
}
.datalog-item {
  padding: 5px;
  margin: 5px;
  border-bottom: 1px solid var(--robo-color-text);
}
.time {
  font-size: 12px;
  display: block;
}
</style>
