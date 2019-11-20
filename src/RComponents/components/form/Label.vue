<template>
  <label>
    {{ label }}:
    <span v-if="isError" class="input-msg">{{ msgError }}</span>
  </label>
</template>

<script>
export default {
  props: {
    label: String,
    msgError: {
      type: String,
      default: "Check if data correct, please."
    },
    isError: {
      type: Boolean,
      default: false
    }
  }
};
</script>
