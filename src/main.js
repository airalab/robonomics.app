import { Buffer } from "buffer";
import { robonomicsUI } from "robonomics-ui-vue";
import { createApp } from "vue";
import App from "./App.vue";
import ipfs from "./plugins/ipfs";
import robonomics from "./plugins/robonomics";
import router from "./router";
import store from "./store";
import filters from "./utils/filters";
import { createHead } from '@unhead/vue';

import "robonomics-ui-vue/style.css";

window.Buffer = Buffer;

const app = createApp(App);
const head = createHead(); // for meta

app
  .use(router)
  .use(store)
  .use(filters)
  .use(robonomics, {
    // endpoint: "ws://127.0.0.1:9944"
    endpoint: "wss://kusama.rpc.robonomics.network/"
  })
  .use(ipfs, {
    api: { gateway: "https://ipfs.url.today" },
    gateways: [
      "https://ipfs.url.today/ipfs/",
      "https://cf-ipfs.com/ipfs/",
      "https://ipfs.io/ipfs/",
      "https://gateway.pinata.cloud/ipfs/",
      "https://gateway.ipfs.io/ipfs/",
      "https://aira.mypinata.cloud/ipfs/"
    ]
  })
  .use(robonomicsUI, { store })
  .use(head)
  .mount("#app");
