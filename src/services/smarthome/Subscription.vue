<template>
  <robo-section>
    <robo-card>
      <robo-card-label>
        <robo-card-label-section>Your controller</robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <robo-card-title
          size="3"
          offset="x05"
          tooltip="Controller is an account, added in subscription accounts list and is used for decrypting chain data."
          tooltipIcon="circle-question"
        >
          Controller
        </robo-card-title>

        <robo-section offset="x05">
          <robo-account-polkadot
            :addressLocal="controller"
            v-model="controller"
            addressLocalAllowEdit
            inputLabel="Controller account"
            inputTip="ED25519 type Parachain account address"
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
import { ref } from "vue";
import { Keyring } from "@polkadot/keyring";
import { encodeAddress } from "@polkadot/util-crypto";

export default {
  setup() {
    const controller = ref("");
    const seed = ref("");

    return {
      controller,
      seed
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
