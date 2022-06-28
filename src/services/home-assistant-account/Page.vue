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
            <robo-card-title size="3">
              Get Home Assistant password:
            </robo-card-title>

            <div>
              crypt: <b>{{ secret }}</b>
            </div>
            <div>
              password: <b>{{ password }}</b>
            </div>
            <robo-text weight="light">
              Enter your test seed phrase to decrypt the password:
            </robo-text>
            <robo-textarea
              v-model="uri"
              placeholder="Place your test seed here"
              offset="x1"
            />
            <robo-button @click="decrypt" outlined>
              Decrypt password
            </robo-button>
          </robo-list-item>

          <robo-list-item>
            <robo-card-title size="3">
              Sign in your Home assistant account using autorization link:
            </robo-card-title>
            <robo-link href="#">Sign in Home Assistant</robo-link>
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
import { decodeAddress } from "@polkadot/util-crypto";

export default {
  data() {
    return {
      ha: "4F6E8k2L4dpUx5Nu1uZDrKfLQxETGG5WkgsZm8PP6EE6Qnyh",
      subAdmin: "4D6GaVUbg6TXDup7gdvHWyERQDK99vyreRU2hjdwptyuQUpP",
      sender: null,
      unsubscribeAccount: null,
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
    }
  },
  async created() {
    if (robonomics.accountManager.account) {
      this.sender = robonomics.accountManager.account.address;
      this.read();
    }
    this.unsubscribeAccount = robonomics.accountManager.onChange((account) => {
      this.sender = account.address;
      this.read();
    });

    robonomics.datalog.on({}, (result) => {
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
  unmounted() {
    if (this.unsubscribeAccount) {
      this.unsubscribeAccount();
    }
  },
  methods: {
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
