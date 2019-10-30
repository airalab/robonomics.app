<template>
  <fragment>
    <slot name="sidebar"></slot>
    <Content>
      <slot />
    </Content>
  </fragment>
</template>

<script>
import Content from "./Content";

export default {
  components: {
    Content
  }
};
</script>
