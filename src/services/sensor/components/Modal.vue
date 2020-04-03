<template>
  <div class="modal-wrapper">
    <h2>{{ $t("sensor.modalTitle") }}</h2>
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
        <button @click="send" :disabled="isWork">
          <div class="loader-ring" v-if="isWork"></div>
          &nbsp;{{ $t("sensor.modalBtn") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["accounts", "select"],
  data() {
    return {
      selected: null,
      isWork: false
    };
  },
  created() {
    this.selected = this.accounts[0].value;
  },
  methods: {
    send() {
      this.isWork = true;
      this.select(
        this.selected,
        () => this.$emit("close"),
        () => {
          this.isWork = false;
        }
      );
    }
  }
};
</script>

<style scoped>
.modal-wrapper {
  padding: 20px;
  height: 100%;
}
.modal-wrapper h2 {
  text-align: center;
}
.modal-content {
  font-size: 16px;
  /* height: 100%; */
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
}
.item {
  margin: 10px;
}
</style>
