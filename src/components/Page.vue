<template>
  <RLayout>
    <template v-slot:sidebar>
      <Sidebar />
    </template>
    <slot />
  </RLayout>
</template>

<script>
import Sidebar from "./Sidebar";

export default {
  components: {
    Sidebar
  }
};
</script>
