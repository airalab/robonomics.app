<template>
  <robo-layout screen footer>
    <layout-header :items="breadcrumbs" />

    <robo-layout-section>
      <robo-grid columns-template="left-center-right">
        <layout-sidebar-left />
        <slot />
        <layout-sidebar-right />
      </robo-grid>
    </robo-layout-section>

    <robo-layout-footer>
      <robo-layout-section>
        <robo-text size="small">
          Robonomics release {{ version }}
          <robo-link :to="link">View changelog</robo-link>
        </robo-text>
      </robo-layout-section>
    </robo-layout-footer>
  </robo-layout>
</template>

<script>
import axios from "axios";
import layoutHeader from "../components/layout/Header.vue";
import layoutSidebarLeft from "../components/layout/SidebarLeft.vue";
import layoutSidebarRight from "../components/layout/SidebarRight.vue";

export default {
  components: {
    layoutHeader,
    layoutSidebarLeft,
    layoutSidebarRight
  },
  data() {
    return {
      version: "",
      link: "https://github.com/airalab/robonomics",
      breadcrumbs: []
    };
  },
  watch: {
    $route: function (newRoute) {
      this.breadcrumbs = newRoute.meta.breadcrumbs;
      document.title = `Dapp Robonomics network | ${newRoute.meta.title}`;
      document
        .querySelector('meta[name="description"]')
        .setAttribute("content", newRoute.meta.description);
    }
  },
  async created() {
    this.breadcrumbs = this.$route.meta.breadcrumbs;
    document.title = `Dapp Robonomics network | ${this.$route.meta.title}`;
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", this.$route.meta.description);
    try {
      const result = await axios.get(
        "https://api.github.com/repos/airalab/robonomics/releases/latest"
      );
      this.version = result.data.tag_name;
      this.link = result.data.html_url;
    } catch (error) {
      console.log(error);
    }
  }
};
</script>
