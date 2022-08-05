<template>
  <robo-grid-item>
    <robo-card allowExpand>
      <robo-card-label>
        <robo-card-label-section>
          Verify your identity
        </robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <robo-list gap="x2" fullLine>
          <robo-list-item>
            <robo-card-title size="3">Choose an account:</robo-card-title>
            <robo-account-polkadot extensionAllowShift inline short />
          </robo-list-item>

          <robo-text
            v-if="!correctAccountType"
            highlight="error"
            style="margin-bottom: 30px"
          >
            Account type must be ed25519
          </robo-text>

          <robo-list-item>
            <robo-text weight="light">
              Enter the seed phrase of your account to encrypt the password
            </robo-text>
            <robo-input
              placeholder="Place seed here"
              offset="x1"
              v-model="uri"
              type="password"
            />
          </robo-list-item>

          <robo-text
            v-if="uri && !validateUri"
            highlight="error"
            style="margin-bottom: 30px"
          >
            Wrong seed phrase
          </robo-text>

          <robo-list-item>
            <robo-text weight="light">
              Enter address of subscription owner
            </robo-text>
            <robo-input v-model="subscriptionOwner" />
            <robo-text weight="light">
              Enter address of administrator Home Assistant
            </robo-text>
            <robo-input v-model="adminHA" />
          </robo-list-item>

          <robo-text
            v-if="subscriptionOwner && !hasSubscription"
            highlight="error"
            style="margin-bottom: 30px"
          >
            Address not added to subscription
          </robo-text>
        </robo-list>
      </robo-card-section>
    </robo-card>

    <robo-card allowExpand>
      <robo-card-label>
        <robo-card-label-section>
          Your Home Assistant password
        </robo-card-label-section>
      </robo-card-label>
      <robo-card-section>
        <robo-list gap="x2" fullLine>
          <div style="margin-bottom: 20px">
            <robo-button
              @click="form = 'registration'"
              :disabled="form === 'registration'"
              >Registration</robo-button
            >
            &nbsp;
            <robo-button
              @click="form = 'recovery'"
              :disabled="form === 'recovery'"
              >Recovery</robo-button
            >
          </div>

          <template v-if="form === 'registration'">
            <robo-list-item v-if="form === 'registration'">
              <robo-text weight="light">Enter password</robo-text>
              <robo-input v-model="passwordInput" type="password" />
            </robo-list-item>

            <robo-list-item v-if="process">
              <robo-text weight="bold" size="medium">
                Please wait <robo-loader />
              </robo-text>
            </robo-list-item>
            <robo-button
              v-if="form === 'registration'"
              @click="savePassword"
              :disabled="
                !correctAccountType ||
                !validateUri ||
                !adminHA ||
                !hasSubscription ||
                !passwordForAdmin ||
                !passwordForRecovery ||
                process
              "
            >
              Registration
            </robo-button>
          </template>

          <template v-else>
            <robo-list-item v-if="encryptedPassword">
              <robo-text weight="light">Your password</robo-text>
              <b>{{ new Date(encryptedPassword.date).toLocaleString() }}</b> |
              <span v-if="encryptedPassword.password">
                {{ encryptedPassword.password }}
              </span>
              <span v-else>
                {{ encryptedPassword.encrypt.substring(0, 5) }}...
              </span>
            </robo-list-item>
            <robo-text v-else highlight="error">Not found password</robo-text>

            <robo-button
              @click="recoveryPassword"
              :disabled="
                !correctAccountType ||
                !validateUri ||
                encryptedPassword === null
              "
            >
              Recovery
            </robo-button>
          </template>
        </robo-list>
      </robo-card-section>
    </robo-card>
  </robo-grid-item>
</template>

<script>
import { onUnmounted, watchEffect, ref, watch } from "vue";
import { useStore } from "vuex";
import { useAccount } from "@/hooks/useAccount";

import robonomics from "../../robonomics";
import { Keyring } from "@polkadot/keyring";
import { u8aToString, u8aToHex, hexToU8a } from "@polkadot/util";
import {
  decodeAddress,
  encodeAddress,
  validateAddress
} from "@polkadot/util-crypto";

export default {
  setup() {
    const subscriptionOwner = ref("");
    const adminHA = ref("");
    const hasSubscription = ref(false);
    const encryptedPassword = ref(null);
    const correctAccountType = ref(false);
    const store = useStore();

    const { account: sender, unsubscribe } = useAccount();
    onUnmounted(() => {
      unsubscribe();
    });

    const checkHasSubscription = async (sender, owner) => {
      try {
        validateAddress(owner);
      } catch (_) {
        hasSubscription.value = false;
        return;
      }
      const devices = await robonomics.rws.getDevices(owner);
      if (devices.includes(sender)) {
        hasSubscription.value = true;
        return;
      }
      hasSubscription.value = false;
    };

    watchEffect(() => {
      checkHasSubscription(sender.value, subscriptionOwner.value);
    });

    const findPassword = async (sender) => {
      let result = null;
      const log = await robonomics.datalog.read(sender);
      for (const item of log) {
        try {
          const json = JSON.parse(item[1].toHuman());
          if (json.admin && json.user && json.ha && json.ha === adminHA.value) {
            if (result === null || result.date < item[0].toNumber()) {
              result = {
                date: item[0].toNumber(),
                encrypt: json.user,
                password: ""
              };
            }
          }
          // eslint-disable-next-line no-empty
        } catch (_) {}
      }
      encryptedPassword.value = result;
    };

    watchEffect(() => {
      findPassword(sender.value);
    });

    watch(adminHA, () => {
      try {
        validateAddress(adminHA.value);
        findPassword(sender.value);
        // eslint-disable-next-line no-empty
      } catch (_) {}
    });

    watch(sender, () => {
      const acc = store.state.robonomicsUIvue.polkadot.accounts.find(
        (item) => item.address === sender.value
      );
      if (acc && acc.type === "ed25519") {
        correctAccountType.value = true;
      } else {
        correctAccountType.value = false;
      }
    });

    return {
      sender,
      subscriptionOwner,
      adminHA,
      hasSubscription,
      encryptedPassword,
      correctAccountType
    };
  },

  data() {
    return {
      error: null,
      process: false,
      message: "",
      uri: "",
      passwordInput: "",
      passwordForAdmin: "",
      passwordForRecovery: "",
      form: "registration"
    };
  },
  computed: {
    account() {
      if (this.uri) {
        try {
          const k = new Keyring();
          return k.addFromUri(this.uri, {}, "ed25519");
        } catch (error) {
          console.log(error);
        }
      }
      return null;
    },
    validateUri() {
      if (
        this.account &&
        this.sender &&
        encodeAddress(this.sender) === encodeAddress(this.account.address)
      ) {
        return true;
      }
      return false;
    }
  },
  watch: {
    passwordInput() {
      this.passwordForRecovery = this.encrypt(
        this.passwordInput,
        this.account.address
      );
      this.passwordForAdmin = this.encrypt(this.passwordInput, this.adminHA);
    }
  },
  methods: {
    recoveryPassword() {
      if (this.encryptedPassword) {
        this.encryptedPassword.password = this.decrypt(
          this.encryptedPassword.encrypt,
          this.account.address
        );
      }
    },
    decrypt(hex, address) {
      const decryptMessage = this.account.decryptMessage(
        hexToU8a(hex),
        u8aToHex(decodeAddress(address))
      );
      return u8aToString(decryptMessage);
    },
    encrypt(password, address) {
      const decryptMessage = this.account.encryptMessage(
        password,
        u8aToHex(decodeAddress(address))
      );
      return u8aToHex(decryptMessage);
    },
    async savePassword() {
      this.error = null;
      this.process = true;
      this.tx = false;
      this.message = "";
      try {
        robonomics.accountManager.useSubscription(this.subscriptionOwner);
        const tx = await robonomics.datalog.write(
          JSON.stringify({
            subscription: this.subscriptionOwner,
            ha: this.adminHA,
            admin: this.passwordForAdmin,
            user: this.passwordForRecovery
          })
        );
        const resultTx = await robonomics.accountManager.signAndSend(tx);
        console.log(resultTx);
        this.process = false;
        this.tx = true;
        this.message = `Saved to block ${resultTx.blockNumber}`;
      } catch (e) {
        console.log(e);
        this.error = e.message;
        this.process = false;
      }
      robonomics.accountManager.useSubscription(false);
    }
  }
};
</script>
