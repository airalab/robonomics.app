<template>
  <div class="modal-wrapper">
    <h2>Accounts</h2>
    <div class="modal-content">
      <div class="item">
        <select v-model="selected">
          <option
            v-for="(option, key) in accounts"
            :value="option.address"
            :key="key"
          >
            {{ option.meta.name }}
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
  props: ["accounts", "onSend"],
  data() {
    return {
      selected: null,
      isWork: false
    };
  },
  created() {
    if (this.accounts.length > 0) {
      this.selected = this.accounts[0].address;
    }
  },
  methods: {
    send() {
      this.isWork = true;
      this.onSend(this.selected);
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
