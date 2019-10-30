<template>
  <a href="javascript:;" class="sidebar-i--lg" :class="{active: isActive}" @click="$emit('toggle')">
    <i v-if="icon" :class="icon"></i>
    <span v-else>{{label}}</span>
  </a>
</template>

<script>
export default {
  props: {
    isActive: {
      type: Boolean,
      default: true
    },
    icon: {
      type: String,
      default: ""
    },
    label: {
      type: String,
      default: ""
    }
  }
};
</script>
