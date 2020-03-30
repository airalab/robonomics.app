<template>
  <router-link :to="to" active-class="active" exact>
    <span v-if="icon" class="align-vertical" :class="icon"></span>
    &nbsp;
    <span class="align-vertical">
      <slot />
    </span>
  </router-link>
</template>

<script>
export default {
  props: ["to", "icon"]
};
</script>
