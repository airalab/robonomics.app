<template>
  <form @submit.prevent="validate">
    <robo-grid offset="x0" gap="x1" columns="1">
      <robo-grid-item>
        <robo-text title="3" offset="x0">User credits</robo-text>
      </robo-grid-item>

      <robo-grid-item>
        <robo-template-rws-activeselect size="small" block label="Choose RWS" />
      </robo-grid-item>

      <robo-grid-item>
        <robo-address-polkadot
          v-model:address="address"
          chain="32"
          label="User address"
        />
      </robo-grid-item>

      <robo-grid-item>
        <robo-input
          label="User seed (12 words)"
          v-model="seed"
          type="password"
          tip="The seed phrase provided here is essential for encrypting your data. We understand the sensitivity of this information and therefore, do not share it with any third parties or store it on our servers. As an extra layer of security, we recommend avoiding storing a large number of tokens in this account to reduce the risk of potential unauthorized access."
        />
      </robo-grid-item>

      <robo-grid-item>
        <robo-button block>Check</robo-button>
      </robo-grid-item>

      <robo-grid-item v-if="error">
        <robo-text highlight="error">
          <template v-if="error === 'require'">
            Oops! Looks like you missed filling in some required fields. Please
            fill in all required fields and try again.
          </template>
          <template v-if="error === 'not-user-subscription'">
            Oops! It seems like your address has not been added to the RWS
            subscription.
          </template>
          <template v-if="error === 'bad-seed'">
            Oops! Seed does not match user address.
          </template>
        </robo-text>
      </robo-grid-item>
    </robo-grid>
  </form>
</template>

<script>
import { useRobonomics } from "@/hooks/useRobonomics";
import { Keyring } from "@polkadot/keyring";
import { encodeAddress, validateAddress } from "@polkadot/util-crypto";
import { ref, watch } from "vue";
import { useStore } from "vuex";

export default {
  emits: ["check"],
  setup(_, { emit }) {
    const address = ref("");
    const seed = ref("");
    const error = ref(false);

    const robonomics = useRobonomics();

    let ownerAddress;
    let controllerAddress;
    const store = useStore();
    watch(
      () => store.state.robonomicsUIvue.rws.active,
      async () => {
        const controller = store.state.robonomicsUIvue.rws.list.find(
          (item) => item.owner === store.state.robonomicsUIvue.rws.active
        );
        if (controller) {
          ownerAddress = controller.owner;
          controllerAddress = controller.controller;
          console.log(ownerAddress);
          console.log(controllerAddress);
        }
      },
      {
        immediate: true
      }
    );

    const validateRequired = () => {
      if (seed.value && address.value) {
        return true;
      }
      return false;
    };

    const hasDeviceSubscription = async (owner, device) => {
      try {
        validateAddress(owner);
        validateAddress(device);
      } catch (_) {
        return false;
      }
      const devices = await robonomics.rws.getDevices(owner);
      if (!devices.isEmpty && devices.toHuman().includes(device)) {
        return true;
      }
      return false;
    };

    const validateSeed = () => {
      try {
        const k = new Keyring();
        const account = k.addFromUri(seed.value, {}, "ed25519");
        if (encodeAddress(address.value) === encodeAddress(account.address)) {
          return true;
        }
      } catch (error) {
        console.log(error);
      }
      return false;
    };

    const validate = async () => {
      if (!validateRequired()) {
        error.value = "require";
      } else if (!(await hasDeviceSubscription(ownerAddress, address.value))) {
        error.value = "not-user-subscription";
      } else if (!validateSeed()) {
        error.value = "bad-seed";
      } else {
        error.value = false;
      }

      if (error.value) {
        emit("check", {
          isCheсk: false,
          ownerAddress: "",
          controllerAddress: "",
          userSeed: ""
        });
      } else {
        emit("check", {
          isCheсk: true,
          ownerAddress,
          controllerAddress,
          userSeed: seed.value
        });
      }
    };

    return {
      address,
      seed,
      error,
      validate
    };
  }
};
</script>
