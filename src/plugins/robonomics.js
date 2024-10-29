import configApp from "@/config";
import keyring from "@polkadot/ui-keyring";
import { Robonomics } from "robonomics-interface";
import { ref, shallowRef } from "vue";
import AccountManager from "./robonomicsAccountManager";

export default {
  install: async (app, params = {}) => {
    const isReady = ref(false);
    const instance = shallowRef();
    const accountManager = new AccountManager(keyring);
    app.provide("RobonomicsProvider", {
      isReady,
      instance,
      accountManager
    });

    const urlParams = new URLSearchParams(window.location.search);
    let endpoint = urlParams.get("rpc");

    if (!endpoint) {
      endpoint =
        localStorage.getItem("rpc-parachain") || configApp.default_rpc_endpoint;
    }
    localStorage.setItem("rpc-parachain", endpoint);
    const config = {
      // endpoint: "ws://127.0.0.1:9944"
      // endpoint: "wss://kusama.rpc.robonomics.network/"
      endpoint
    };

    instance.value = await Robonomics.createInstance({ ...config, ...params });
    instance.value.setAccountManager(accountManager);
    isReady.value = true;
  }
};
