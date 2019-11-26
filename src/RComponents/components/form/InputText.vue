<template>
  <input
    type="text"
    :class="{ 'container-full': full, error: isError }"
    :value="value"
    :placeholder="placeholder"
    @input="$emit('input', $event.target.value)"
  />
</template>

<script>
export default {
  props: {
    value: String,
    placeholder: String,
    isError: {
      type: Boolean,
      default: false
    },
    full: {
      type: Boolean,
      default: true
    }
  }
};
</script>
