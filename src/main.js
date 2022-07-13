import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Ipfs from "./ipfs";
import { robonomicsUI } from "robonomics-ui-vue";
import "robonomics-ui-vue/style.css";
import { vfmPlugin } from "vue-final-modal";

const app = createApp(App);

app.config.globalProperties.$apptextSubscriptionInfo =
  "The Robonomics RWS subscription lets you interact with smart devices and robots through the Robonomics parachain instead of centralized cloud services and providers.";

app
  .use(router)
  .use(store)
  .use(robonomicsUI, { store })
  .use(Ipfs)
  .use(vfmPlugin)
  .mount("#app");
