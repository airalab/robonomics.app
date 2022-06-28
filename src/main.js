import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Ipfs from "./ipfs";
import { robonomicsUI } from "robonomics-ui-vue";
import "robonomics-ui-vue/style.css";

const app = createApp(App);

app.use(router).use(store).use(robonomicsUI, { store }).use(Ipfs).mount("#app");
