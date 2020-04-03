<template>
  <a class="sidebar-i--lg" href="javascript:;" @click="changeTheme()">
    <i class="i-day" v-show="theme === 'light'"></i>
    <i class="i-night" v-show="theme === 'dark'"></i>
  </a>
</template>

<script>
export default {
  data() {
    return {
      themes: ["dark", "light"],
      theme: "light"
    };
  },
  mounted() {
    const theme = window.localStorage.getItem("theme") || "light";
    this.setTheme(theme);
  },
  methods: {
    setTheme(theme) {
      this.theme = theme;
      const el = document.body;
      this.themes.forEach(function(item) {
        el.classList.remove("theme-" + item);
      });
      el.classList.add("theme-" + theme);
    },
    changeTheme() {
      const theme = this.theme === "dark" ? "light" : "dark";
      window.localStorage.setItem("theme", theme);
      this.setTheme(theme);
    }
  }
};
</script>
