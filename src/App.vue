<template>
  <layout-main v-if="isReady">
    <router-view />
  </layout-main>
  <robo-layout v-else>
    <robo-grid screen>
      <robo-grid-item valign="center" align="center">
        <robo-logo title animate />
      </robo-grid-item>
    </robo-grid>
  </robo-layout>
</template>

<script>
import LayoutMain from "./layouts/Main.vue";
import robonomics from "./robonomics";

export default {
  components: { LayoutMain },
  data() {
    return {
      isReady: false
    };
  },
  async created() {
    document.documentElement.setAttribute("lang", "en");
    await robonomics.run();
    this.isReady = true;
  }
};
</script>
