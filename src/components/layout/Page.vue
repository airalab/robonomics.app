<template>
  <fragment>
    <Sidebar />
    <RLayout>
      <slot />
      <Status />
    </RLayout>
  </fragment>
</template>

<script>
import Sidebar from "./Sidebar";
import Status from "../Status";

export default {
  components: {
    Sidebar,
    Status
  }
};
</script>
