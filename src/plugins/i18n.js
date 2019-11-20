import Vue from "vue";
import VueI18n from "vue-i18n";
import messages from "./messages";

Vue.use(VueI18n);

const lang = window.localStorage.lang || "en";

export default new VueI18n({
  locale: lang,
  fallbackLocale: "en",
  messages
});
