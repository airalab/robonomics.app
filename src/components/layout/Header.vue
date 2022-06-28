<template>
  <robo-layout-section dark>
    <robo-grid
      columns-template="left-center"
      valign="center"
      media-mobile="no-cols"
    >
      <robo-grid-item>
        <robo-logo title light media-mobile="collapse" />
      </robo-grid-item>

      <robo-grid-item>
        <robo-breadcrumbs :items="items" />
      </robo-grid-item>
    </robo-grid>
  </robo-layout-section>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "layoutHeader",

  props: {
    items: {
      type: Object
    }
  }
});
</script>
