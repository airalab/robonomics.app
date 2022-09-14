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
  .use(Ipfs, {
    config: {
      Addresses: {
        Swarm: [
          "/dns4/1.webrtcstar.aira.life/tcp/443/wss/p2p-webrtc-star/",
          "/dns4/2.webrtcstar.aira.life/tcp/443/wss/p2p-webrtc-star/",
          "/dns4/3.webrtcstar.aira.life/tcp/443/wss/p2p-webrtc-star/"
        ]
      },
      Bootstrap: [
        "/dns4/1.pubsub.aira.life/tcp/443/wss/ipfs/QmdfQmbmXt6sqjZyowxPUsmvBsgSGQjm4VXrV7WGy62dv8",
        "/dns4/2.pubsub.aira.life/tcp/443/wss/ipfs/QmPTFt7GJ2MfDuVYwJJTULr6EnsQtGVp8ahYn9NSyoxmd9",
        "/dns4/3.pubsub.aira.life/tcp/443/wss/ipfs/QmWZSKTEQQ985mnNzMqhGCrwQ1aTA6sxVsorsycQz9cQrw"
      ]
    }
  })
  .use(vfmPlugin)
  .mount("#app");
