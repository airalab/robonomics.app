import keyring from "@polkadot/ui-keyring";
import { Robonomics } from "robonomics-interface";
import { ref, shallowRef } from "vue";
import AccountManager from "./robonomicsAccountManager";

export default {
  install: async (app, params) => {
    const isReady = ref(false);
    const instance = shallowRef();
    const accountManager = new AccountManager(keyring);
    app.provide("RobonomicsProvider", {
      isReady,
      instance,
      accountManager
    });
    instance.value = await Robonomics.createInstance(params);
    instance.value.setAccountManager(accountManager);
    isReady.value = true;
  }
};
