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
          </robo-list-item>

          <robo-list-item>
            <robo-text weight="light">
              Enter address of the account that encrypted the password
            </robo-text>
            <robo-input
              placeholder="Place address here"
              offset="x1"
              v-model="subAdmin"
            />
          </robo-list-item>

          <robo-list-item>
            <robo-card-title size="3">
              Get Home Assistant password:
            </robo-card-title>

            <template v-if="isSubscription">
              <robo-text weight="bold">crypted password:</robo-text>
              <robo-text v-if="secret" break gap size="small">
                {{ secret }}
              </robo-text>
              <robo-loader v-else />
            </template>

            <robo-text weight="light">
              Enter the seed phrase of your account to decrypt the password
            </robo-text>
            <robo-input
              placeholder="Place seed here"
              offset="x1"
              v-model="uri"
              type="password"
            />
            <robo-button
              @click="decrypt"
              outlined
              :disabled="!validateUri || !secret || !subAdmin"
            >
              Decrypt password
            </robo-button>
          </robo-list-item>

          <robo-list-item>
            <robo-card-title size="3">
              Sign in your Home assistant account using login and password for
              autorization:
            </robo-card-title>

            <template v-if="password">
              <robo-text weight="bold">login:</robo-text>
              <robo-text gap size="small">
                <robo-account-polkadot copy />
              </robo-text>

              <robo-text weight="bold">password:</robo-text>
              <robo-text break copy gap size="small">{{ password }}</robo-text>
            </template>
            <robo-text gap>http://192.168.xx.xx:xxxx/</robo-text>
          </robo-list-item>
        </robo-list>
      </robo-card-section>
    </robo-card>
  </robo-grid-item>
</template>

<script>
import robonomics from "../../robonomics";
import { Keyring } from "@polkadot/keyring";
import { u8aToString, u8aToHex } from "@polkadot/util";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

export default {
  data() {
    return {
      ha: "",
      subAdmin: "",
      isSubscription: false,
      sender: null,
      unsubscribeAccount: null,
      unsubscribeDatalog: null,
      error: null,
      process: false,
      log: [],
      secret: "",
      password: "",
      uri: ""
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
      this.hasSubscription();
      this.read();
    }
    this.unsubscribeAccount = robonomics.accountManager.onChange((account) => {
      this.sender = account.address;
      this.hasSubscription();
      this.read();
    });

    this.unsubscribeDatalog = robonomics.datalog.on({}, (result) => {
      result
        .filter((item) => item.account.toHuman() === this.ha)
        .forEach((item) => {
          try {
            const json = JSON.parse(item.data.toHuman());
            if (json.address && json.password && json.address === this.sender) {
              this.secret = json.password;
            }
            // eslint-disable-next-line no-empty
          } catch (_) {}
        });
    });
  },
  watch: {
    ha() {
      this.hasSubscription();
      this.read();
    }
  },
  unmounted() {
    if (this.unsubscribeAccount) {
      this.unsubscribeAccount();
    }
    if (this.unsubscribeDatalog) {
      this.unsubscribeDatalog();
    }
  },
  methods: {
    async hasSubscription() {
      const devices = await robonomics.rws.getDevices(this.ha);
      if (devices.includes(this.sender)) {
        this.isSubscription = true;
        return;
      }
      this.isSubscription = false;
    },
    async read() {
      const log = await robonomics.datalog.read(this.ha);
      for (const item of log) {
        try {
          const json = JSON.parse(item[1].toHuman());
          if (json.address && json.password && json.address === this.sender) {
            this.secret = json.password;
          }
          // eslint-disable-next-line no-empty
        } catch (_) {}
      }
    },
    decrypt() {
      const decryptMessage = this.account.decryptMessage(
        this.secret,
        u8aToHex(decodeAddress(this.subAdmin))
      );
      this.password = u8aToString(decryptMessage);
    }
  }
};
</script>
