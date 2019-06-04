<template>
  <div class="dropdown dropdown-color">
    <a class="a-noline" href="javascript:;">
      <span
        :class="[($i18n.locale == 'en') ? 'sprite-basic-flag-en' : 'sprite-basic-flag-ru']"
        class="d-block"
      ></span>
    </a>
    <div class="dropdown-content">
      <div class="inside">
        <nav>
          <a class="a-noline" @click="changeLang(($i18n.locale == 'en') ? 'ru' : 'en')">
            <i :class="[($i18n.locale == 'en') ? 'sprite-basic-flag-ru' : 'sprite-basic-flag-en']"></i>
          </a>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["loader"],
  methods: {
    changeLang(local) {
      this.loader();
      window.localStorage.lang = local;
      this.$i18n.locale = local;
    }
  }
};
</script>
