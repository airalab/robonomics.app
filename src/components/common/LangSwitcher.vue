<template>
  <nav class="nav-vertical">
    <a
      href="javascript:;"
      :class="{ active: $i18n.locale == 'en' }"
      @click="changeLang('en')"
    >EN - English</a>
    <a
      href="javascript:;"
      :class="{ active: $i18n.locale == 'ru' }"
      @click="changeLang('ru')"
    >RU - Русский</a>
  </nav>
</template>

<script>
export default {
  props: ["loadContent"],
  methods: {
    changeLang(local) {
      this.loadContent();
      window.localStorage.lang = local;
      this.$i18n.locale = local;
    }
  }
};
</script>
