<template>
  <form @submit.prevent="createPassword">
    <robo-grid offset="x1" gap="x1" columns="1" :disabled="!isCheсk">
      <robo-grid-item>
        <robo-text title="3" offset="x0">New password</robo-text>
      </robo-grid-item>

      <robo-grid-item>
        <robo-input label="New password" v-model="password" type="password" />
      </robo-grid-item>

      <robo-grid-item>
        <robo-input
          label="Repeat password"
          v-model="passwordRepeat"
          type="password"
        />
      </robo-grid-item>

      <robo-grid-item>
        <robo-button block :disabled="isDisabled">Submit</robo-button>
      </robo-grid-item>

      <robo-grid-item v-if="error">
        <robo-text highlight="error">
          {{ error }}
        </robo-text>
      </robo-grid-item>
    </robo-grid>
  </form>
</template>

<script>
import { useRobonomics } from "@/hooks/useRobonomics";
import { useSend } from "@/hooks/useSend";
import { Keyring } from "@polkadot/keyring";
import { u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { computed, ref, toRefs, watch, watchEffect } from "vue";
import { useStore } from "vuex";

export default {
  props: {
    isCheсk: Boolean,
    ownerAddress: String,
    controllerAddress: String,
    userSeed: String
  },
  setup(props) {
    const { isCheсk, ownerAddress, controllerAddress, userSeed } =
      toRefs(props);

    const password = ref("");
    const passwordRepeat = ref("");
    const error = ref("");

    const robonomics = useRobonomics();
    const tx = useSend();
    const store = useStore();

    let accountUser;
    watch(
      userSeed,
      () => {
        if (isCheсk.value) {
          try {
            const k = new Keyring({
              ss58Format: robonomics.api?.registry.chainSS58
            });
            accountUser = k.addFromUri(userSeed.value, {}, "ed25519");
            return;
          } catch (error) {
            console.log(error);
          }
        }
        accountUser = null;
      },
      { immediate: true }
    );

    const encrypt = (password, address) => {
      const decryptMessage = accountUser.encryptMessage(
        password,
        u8aToHex(decodeAddress(address))
      );
      return u8aToHex(decryptMessage);
    };

    let passwordForRecovery;
    let passwordForAdmin;
    watchEffect(() => {
      if (
        isCheсk.value &&
        validateRequired.value &&
        checkPasswordsMatch.value
      ) {
        passwordForRecovery = encrypt(password.value, accountUser.address);
        passwordForAdmin = encrypt(password.value, controllerAddress.value);
      } else {
        passwordForRecovery = "";
        passwordForAdmin = "";
      }

      console.log({ passwordForRecovery, passwordForAdmin });
    });

    const validateRequired = computed(() => {
      if (password.value && passwordRepeat.value) {
        return true;
      }
      return false;
    });
    const checkPasswordsMatch = computed(() => {
      return password.value === passwordRepeat.value;
    });
    const isDisabled = computed(() => {
      if (tx.process.value) {
        console.log("process");
        return true;
      }
      if (!isCheсk.value) {
        console.log("isCheсk");
        return true;
      }
      if (!validateRequired.value) {
        console.log("validateRequire");
        return true;
      }
      if (!checkPasswordsMatch.value) {
        console.log("checkPasswordsMatch");
        return true;
      }
      if (!passwordForAdmin || !passwordForRecovery) {
        console.log("passwordForAdmin passwordForRecovery");
        return true;
      }
      return false;
    });

    const createPassword = async () => {
      if (!isCheсk.value) {
        return;
      }

      robonomics.accountManager.account = accountUser;

      const call = await robonomics.datalog.write(
        JSON.stringify({
          subscription: ownerAddress.value,
          ha: controllerAddress.value,
          admin: passwordForAdmin,
          user: passwordForRecovery
        })
      );
      await tx.send(call, ownerAddress.value);
      if (tx.error.value) {
        if (tx.error.value !== "Cancelled") {
          error.value = tx.error.value;
        } else {
          console.log("calcel");
        }
      }

      const accountOld = store.state.robonomicsUIvue.polkadot.accounts.find(
        (item) => item.address === store.state.robonomicsUIvue.polkadot.address
      );
      await robonomics.accountManager.setSender(accountOld.address, {
        type: accountOld.type,
        extension: store.state.robonomicsUIvue.polkadot.extensionObj
      });
    };

    return {
      password,
      passwordRepeat,
      error,
      isDisabled,
      createPassword
    };
  }
};
</script>
