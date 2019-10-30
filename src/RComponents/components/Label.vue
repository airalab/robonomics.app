<template>
  <span class="label" :class="[`label-${color}`, small ? 't-sm' : '']">
    <slot />
  </span>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: "blue"
    },
    small: {
      type: Boolean,
      default: false
    }
  }
};
</script>
