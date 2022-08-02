<template>
  <robo-grid-item>
    <robo-card allowExpand>
      <robo-card-label>
        <robo-card-label-section>
          Home Assistant account
        </robo-card-label-section>
        <robo-card-label-section info>
          Get
          <robo-link href="https://www.home-assistant.io">
            Home Assistant
          </robo-link>
          account for Robonomics Parachain usage
        </robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <robo-list gap="x2" fullLine>
          <robo-list-item>
            <robo-card-title size="3">Choose an account:</robo-card-title>
            <robo-account-polkadot extensionAllowShift inline short />
          </robo-list-item>

          <robo-list-item>
            <robo-text weight="light">
              Enter address of subscription owner
            </robo-text>
            <robo-input v-model="ha" />
            <robo-text weight="light">
              Enter address of administrator Home Assistant
            </robo-text>
            <robo-input v-model="subAdmin" />
          </robo-list-item>

          <template v-if="isSubscription">
            <div
              v-if="encryptedPasswords.length > 0"
              style="margin-bottom: 20px"
            >
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

            <robo-list-item v-if="form === 'recovery'">
              <robo-text weight="light">Your passwords</robo-text>
              <div v-for="(item, k) in encryptedPasswords" :key="k">
                <b>{{ item.date }}</b> |
                <span v-if="item.password">{{ item.password }}</span>
                <span v-else>{{ item.encrypt.substring(0, 5) }}...</span>
              </div>
            </robo-list-item>

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

            <template v-if="validateUri">
              <robo-button v-if="form === 'recovery'" @click="recoveryPassword">
                recovery
              </robo-button>

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
                :disabled="!passwordForAdmin || !passwordForRecovery || process"
              >
                Registration
              </robo-button>

              <robo-list-item style="margin-top: 20px">
                <robo-card-title size="3">
                  Sign in your Home assistant account using login and password
                  for autorization:
                </robo-card-title>
                <robo-text gap>http://192.168.xx.xx:xxxx/</robo-text>
              </robo-list-item>
            </template>
          </template>
        </robo-list>
      </robo-card-section>
    </robo-card>
  </robo-grid-item>
</template>

<script>
import robonomics from "../../robonomics";
import { Keyring } from "@polkadot/keyring";
import { u8aToString, u8aToHex, hexToU8a } from "@polkadot/util";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

export default {
  data() {
    return {
      ha: "",
      subAdmin: "",
      isSubscription: false,
      sender: null,
      unsubscribeAccount: null,
      error: null,
      process: false,
      message: "",
      uri: "",
      passwordInput: "",
      passwordForAdmin: "",
      passwordForRecovery: "",
      encryptedPasswords: [],
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
        encodeAddress(this.sender) === encodeAddress(this.account.address)
      ) {
        return true;
      }
      return false;
    }
  },
  async created() {
    if (robonomics.accountManager.account) {
      this.sender = robonomics.accountManager.account.address;
      this.findPassword();
      this.hasSubscription();
    }
    this.unsubscribeAccount = robonomics.accountManager.onChange((account) => {
      this.sender = account.address;
      this.findPassword();
      this.hasSubscription();
    });
  },
  watch: {
    ha() {
      this.hasSubscription();
    },
    passwordInput() {
      this.passwordForRecovery = this.encrypt(
        this.passwordInput,
        this.account.address
      );
      this.passwordForAdmin = this.encrypt(this.passwordInput, this.subAdmin);
    }
  },
  unmounted() {
    if (this.unsubscribeAccount) {
      this.unsubscribeAccount();
    }
  },
  methods: {
    async findPassword() {
      this.encryptedPasswords = [];
      const log = await robonomics.datalog.read(this.sender);
      for (const item of log) {
        try {
          const json = JSON.parse(item[1].toHuman());
          if (json.admin && json.user) {
            this.encryptedPasswords.push({
              date: new Date(item[0].toNumber()).toLocaleString(),
              encrypt: json.user,
              password: ""
            });
          }
          // eslint-disable-next-line no-empty
        } catch (_) {}
      }
    },
    recoveryPassword() {
      for (const k in this.encryptedPasswords) {
        this.encryptedPasswords[k].password = this.decrypt(
          this.encryptedPasswords[k].encrypt,
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
        robonomics.accountManager.useSubscription(this.ha);
        const tx = await robonomics.datalog.write(
          JSON.stringify({
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
    },
    async hasSubscription() {
      const devices = await robonomics.rws.getDevices(this.ha);
      if (devices.includes(this.sender)) {
        this.isSubscription = true;
        return;
      }
      this.isSubscription = false;
    }
  }
};
</script>
