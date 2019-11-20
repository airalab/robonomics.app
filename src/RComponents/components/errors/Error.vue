<template>
  <section class="msg-error msg-icon">
    <div class="msg-title">{{ title }}</div>
    <slot />
  </section>
</template>

<script>
export default {
  props: ["title"]
};
</script>
