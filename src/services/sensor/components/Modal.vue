<template>
  <div class="modal-content">
    <div class="item">
      <select v-model="selected">
        <option
          v-for="(option, key) in accounts"
          :value="option.value"
          :key="key"
        >
          {{ option.text }}
        </option>
      </select>
    </div>
    <div class="item">
      <button @click="select(selected, () => $emit('close'))">send</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["accounts", "select"],
  data() {
    return {
      selected: null
    };
  },
  created() {
    this.selected = this.accounts[0].value;
  }
};
</script>

<style scoped>
.modal-content {
  font-size: 16px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
}
.item {
  margin: 10px;
}
</style>
