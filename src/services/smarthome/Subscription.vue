<template>
  <robo-section>
    <robo-card>
      <robo-card-label>
        <robo-card-label-section>Your subscription</robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <robo-card-title
          size="3"
          offset="x05"
          tooltip="Choose account that owns subsription"
          tooltipIcon="circle-question"
        >
          1. Subscription
        </robo-card-title>

        <robo-account-polkadot extensionAllowShift selectable short />

        <robo-notification
          v-if="subscription.isActive.value"
          :title="`Subscription active till ${subscription.validUntilFormat.value}`"
          type="success"
          offset="x1"
        />
        <robo-notification
          v-else
          title="No active subsription"
          type="warning"
          offset="x1"
        />
      </robo-card-section>

      <robo-card-section>
        <robo-card-title
          size="3"
          offset="x05"
          tooltip="Controller is an account, added in subscription accounts list and is used for decrypting chain data."
          tooltipIcon="circle-question"
        >
          2. Controller
        </robo-card-title>

        <robo-section offset="x05">
          <robo-select
            :options="
              devices.map((item) => {
                return `${item.address.substr(0, 5)}...${item.address.substr(
                  -5
                )}`;
              })
            "
            :values="devices.map((item) => item.address)"
            v-model="controller"
            block
          />
        </robo-section>

        <robo-section offset="x05">
          <robo-input
            label="The seed phrase to encrypt data"
            tip="A seed phrase is a series of 12 simple randomized words"
            v-model="seed"
            type="password"
            :disabled="
              $store.state.robonomicsUIvue.polkadot.address ? false : true
            "
          />
        </robo-section>

        <robo-notification
          v-if="seed && !validateUri"
          title="Wrong seed phrase"
          type="warning"
        />
      </robo-card-section>
    </robo-card>
  </robo-section>
</template>

<script>
import { onUnmounted, ref, watch } from "vue";
import { useAccount } from "@/hooks/useAccount";
import { useSubscription } from "@/hooks/useSubscription";
import { useDevices } from "@/hooks/useDevices";
import { Keyring } from "@polkadot/keyring";
import { encodeAddress } from "@polkadot/util-crypto";

export default {
  setup() {
    const controller = ref("");
    const seed = ref("");
    const { account, unsubscribe } = useAccount();

    onUnmounted(() => {
      unsubscribe();
    });

    const subscription = useSubscription(account);

    const { devices, loadDevices } = useDevices(account);

    watch(devices, () => {
      if (devices.value.length) {
        controller.value = devices.value[0].address;
      } else {
        controller.value = "";
      }
    });

    return {
      controller,
      seed,
      account,
      subscription,
      devices,
      loadDevices
    };
  },
  emits: ["controller"],
  computed: {
    controllerAccount() {
      if (this.seed) {
        try {
          const k = new Keyring();
          return k.addFromUri(this.seed, {}, "ed25519");
        } catch (error) {
          console.log(error);
        }
      }
      return null;
    },
    validateUri() {
      if (
        this.controllerAccount &&
        this.controller &&
        encodeAddress(this.controller) ===
          encodeAddress(this.controllerAccount.address)
      ) {
        return true;
      }
      return false;
    }
  },
  watch: {
    validateUri: {
      immediate: true,
      handler() {
        this.$emit("controller", this.controllerAccount);
      }
    }
  }
};
</script>
