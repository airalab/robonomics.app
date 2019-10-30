<template>
  <button :class="{'container-full': full, 'btn-big': big, 'btn-green': green}">
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    full: {
      type: Boolean,
      default: false
    },
    big: {
      type: Boolean,
      default: false
    },
    green: {
      type: Boolean,
      default: false
    }
  }
};
</script>
