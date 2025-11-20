import configApp from "@/config";
import polkadot from "robonomics-interface-vue";

export default {
  install: (app) => {
    const urlParams = new URLSearchParams(window.location.search);
    let endpoint = urlParams.get("rpc");
    if (!endpoint) {
      endpoint =
        localStorage.getItem("rpc-parachain") || configApp.default_rpc_endpoint;
    }
    localStorage.setItem("rpc-parachain", endpoint);
    app.use(polkadot, {
      start: true,
      // endpoint: "ws://127.0.0.1:9944/"
      endpoint
    });
  }
};
