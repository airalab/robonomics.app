import keyring from "@polkadot/ui-keyring";
import { Robonomics } from "robonomics-interface";
import { reactive, ref, toRaw } from "vue";
import AccountManager from "./robonomicsAccountManager";

export default {
  install: async (app, params) => {
    const isReady = ref(false);
    const instance = reactive({ value: undefined });
    app.provide("RobonomicsProvider", {
      isReady,
      instance
    });
    instance.value = await Robonomics.createInstance(params);
    toRaw(instance).value.setAccountManager(new AccountManager(keyring));
    isReady.value = true;
  }
};
