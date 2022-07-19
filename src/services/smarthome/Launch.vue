<template>
  <div>
    <robo-list gap="x2" fullLine>
      <robo-list-item>
        <robo-text weight="light">Platform</robo-text>
        <robo-input v-model="platform" />
      </robo-list-item>
      <robo-list-item>
        <robo-text weight="light">Name</robo-text>
        <robo-input v-model="name" />
      </robo-list-item>
    </robo-list>

    <h5>Params</h5>
    <robo-list gap="x2" fullLine>
      <robo-list-item v-for="(item, key) in params" :key="key">
        <robo-text weight="light">Name</robo-text>
        <robo-input v-model="item.name" />
        <robo-text weight="light">Value</robo-text>
        <robo-input v-model="item.value" />
        <div style="text-align: right">
          <robo-button
            iconLeft="xmark"
            type="alarm"
            size="small"
            @click="removeParam(key)"
            :disabled="key === 0"
          >
            remove
          </robo-button>
        </div>
      </robo-list-item>
    </robo-list>

    <div
      style="
        margin-bottom: 20px;
        text-align: right;
        margin-top: -20px;
        padding-bottom: 20px;
      "
    >
      <robo-button iconLeft="plus" size="small" type="ok" @click="addParam" />
    </div>

    <div>
      <div>
        <input v-model="isCrypto" type="checkbox" id="isCrypto" />
        <label for="isCrypto">crypto</label>
      </div>

      <div v-if="isCrypto">
        <h5>Your secret key for crypt message</h5>
        <robo-input v-model="uri" type="password" placeholder="secret" />
        <div v-if="!validateUri">Input your secret key</div>
        <robo-input v-if="validateUri" v-model="encryptMessage" disabled />
      </div>
    </div>

    <div v-if="message" class="alert alert-info">{{ message }}</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div style="margin-top: 20px">
      <robo-button @click="save" :disabled="process || !canSend">
        <span v-if="process">...</span>
        <template v-else>Send</template>
      </robo-button>
    </div>
  </div>
</template>

<script>
import { utils } from "robonomics-interface";
import robonomics from "../../robonomics";
import { addFile } from "../../ipfs";
import { Keyring } from "@polkadot/keyring";
import { u8aToHex } from "@polkadot/util";
import { encodeAddress, decodeAddress } from "@polkadot/util-crypto";

export default {
  props: ["address", "sender"],
  data() {
    return {
      platform: "",
      name: "",
      params: [],
      error: null,
      message: null,
      process: false,
      isCrypto: false,
      uri: ""
    };
  },
  computed: {
    account() {
      if (this.uri) {
        try {
          const k = new Keyring();
          const a1 = k.addFromUri(this.uri, {}, "ed25519");
          console.log(this.sender);
          console.log(encodeAddress(this.sender), encodeAddress(a1.address));
          if (encodeAddress(this.sender) === encodeAddress(a1.address)) {
            return a1;
          }
          const a2 = k.addFromUri(this.uri, {}, "sr25519");
          console.log(encodeAddress(this.sender), encodeAddress(a2.address));
          if (encodeAddress(this.sender) === encodeAddress(a2.address)) {
            return a2;
          }
          return a1;
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
    },
    encryptMessage() {
      if (this.validateUri) {
        return this.encrypt(this.getParameter());
      }
      return "";
    },
    canSend() {
      if (this.isCrypto) {
        if (this.validateUri && this.encryptMessage) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    }
  },
  created() {
    this.params.push({ name: "entity_id", value: "" });
  },
  methods: {
    getParameter() {
      const params = {};
      for (const item of this.params) {
        params[item.name] = item.value;
      }
      const parameter = {
        platform: this.platform,
        name: this.name,
        params: params
      };
      return JSON.stringify(parameter);
    },
    async save() {
      this.message = null;
      this.error = null;
      this.process = true;
      const subscriber = robonomics.accountManager.account.address;
      try {
        let msg = this.getParameter();
        if (this.isCrypto && this.validateUri) {
          msg = this.encryptMessage;
        }
        const hash = await addFile("launch", msg);
        console.log("subscription", subscriber);
        console.log("sender", this.sender);
        robonomics.accountManager.useSubscription(subscriber, this.sender);
        console.log("signer", robonomics.accountManager.account.address);
        const tx = await robonomics.launch.send(
          this.address,
          utils.cidToHex(hash)
        );
        const resultTx = await robonomics.accountManager.signAndSend(tx);
        console.log(resultTx);
        this.process = false;
        this.message = `Saved to block ${resultTx.blockNumber}`;
      } catch (e) {
        console.log(e);
        this.error = e.message;
        this.process = false;
      }
      robonomics.accountManager.setSender(subscriber);
    },
    addParam() {
      this.params.push({ name: "", value: "" });
    },
    removeParam(key) {
      this.params.splice(key, 1);
    },
    encrypt(message) {
      const encryptMessage = this.account.encryptMessage(
        message,
        u8aToHex(decodeAddress(this.address))
      );
      return u8aToHex(encryptMessage);
    }
  }
};
</script>
