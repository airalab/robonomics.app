<template>
  <form @submit.prevent="validate">
    <robo-grid offset="x0" gap="x1" columns="1">
      <robo-grid-item>
        <robo-text title="3" offset="x0">User credits</robo-text>
      </robo-grid-item>

      <robo-grid-item>
        <robo-template-rws-activeselect size="small" block label="Choose RWS" />
      </robo-grid-item>

      <robo-grid-item v-if="!hasRwsSetup">
        <robo-address-polkadot
          v-model:address="controllerAddress"
          chain="32"
          label="Controller address"
        />
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

      <robo-grid-item v-if="warn">
        <robo-text highlight="attention">
          <template v-if="warn === 'user-exist'">
            Warn! The specified account address is already registered.
          </template>
        </robo-text>
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
          <template v-if="error === 'bad-type'">
            Oops! Address should be ed25519 type
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
import { useIpfs } from "@/hooks/useIpfs";
import { useRobonomics } from "@/hooks/useRobonomics";
import { getLastDatalog } from "@/utils/telemetry";
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
    const warn = ref(false);
    const hasRwsSetup = ref(false);
    const controllerAddress = ref("");

    const robonomics = useRobonomics();
    const ipfs = useIpfs();

    let ownerAddress;
    const store = useStore();
    watch(
      () => store.state.robonomicsUIvue.rws.active,
      async () => {
        const controller = store.state.robonomicsUIvue.rws.list.find(
          (item) => item.owner === store.state.robonomicsUIvue.rws.active
        );
        if (controller) {
          ownerAddress = controller.owner;
          controllerAddress.value = controller.controller;
        } else {
          ownerAddress = store.state.robonomicsUIvue.rws.active;
        }
      },
      {
        immediate: true
      }
    );
    watch(
      () => store.state.robonomicsUIvue.rws.list,
      async () => {
        hasRwsSetup.value = !!store.state.robonomicsUIvue.rws.list.length;
      },
      {
        immediate: true
      }
    );

    const validateRequired = () => {
      if (seed.value && address.value && controllerAddress.value) {
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

    const validateSeed = (type = "ed25519") => {
      try {
        const k = new Keyring();
        const account = k.addFromUri(seed.value, {}, type);
        if (encodeAddress(address.value) === encodeAddress(account.address)) {
          return true;
        }
      } catch (error) {
        console.log(error);
      }
      return false;
    };

    const validate = async () => {
      error.value = false;
      warn.value = false;
      if (!validateRequired()) {
        error.value = "require";
      } else if (validateSeed("sr25519")) {
        error.value = "bad-type";
      } else if (!(await hasDeviceSubscription(ownerAddress, address.value))) {
        error.value = "not-user-subscription";
      } else if (!validateSeed()) {
        error.value = "bad-seed";
      } else {
        const datalog = await getLastDatalog(
          robonomics,
          controllerAddress.value
        );
        const result = await ipfs.catViaGateway(
          store.state.robonomicsUIvue.ipfs.activegateway,
          datalog.cid,
          5
        );
        if (result && result[address.value]) {
          warn.value = "user-exist";
        } else {
          if (!result) {
            console.log("Error: datalog not found in ipfs");
          }
        }
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
          controllerAddress: controllerAddress.value,
          userSeed: seed.value
        });
      }
    };

    return {
      hasRwsSetup,
      controllerAddress,
      address,
      seed,
      error,
      warn,
      validate
    };
  }
};
</script>
