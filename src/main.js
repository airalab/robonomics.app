import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "./plugins/i18n";
import wait from "./plugins/wait";
import "./plugins";

Vue.config.productionTip = false;

new Vue({
  store,
  i18n,
  router,
  wait,
  render: (h) => h(App)
}).$mount("#app");
