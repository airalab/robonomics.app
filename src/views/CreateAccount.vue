<template>
  <robo-section>
    <robo-card>
      <robo-card-label>
        <robo-card-label-section>Generate account</robo-card-label-section>
      </robo-card-label>

      <robo-section offset="x05">
        <div>{{ address }}</div>
        <div>{{ seed }}</div>
        <div>{{ type }}</div>
        <robo-button @click="generate">generate new address</robo-button>
      </robo-section>

      <br />

      <robo-section offset="x05">
        <robo-input v-model="name" label="Name" />
        <robo-input v-model="password" label="Password" />
        <robo-button @click="save">download json</robo-button>
      </robo-section>
    </robo-card>
  </robo-section>
</template>

<script>
import { mnemonicGenerate } from "@polkadot/util-crypto";
import FileSaver from "file-saver";
import robonomics from "../robonomics";

export default {
  data() {
    return {
      name: "Account",
      password: "",
      address: "",
      seed: "",
      type: "ed25519"
    };
  },
  created() {
    this.generate();
  },
  methods: {
    generate() {
      this.seed = mnemonicGenerate();
      this.address = robonomics.accountManager.keyring.createFromUri(
        this.seed,
        {},
        this.pairType
      ).address;
    },
    save() {
      if (!this.name || !this.password) {
        return;
      }
      const genesisHash = robonomics.api.genesisHash.toString();
      const tags = [];
      const pair = robonomics.accountManager.keyring.keyring.addFromUri(
        this.seed,
        { genesisHash, isHardware: false, name: this.name, tags },
        this.pairType
      );
      const json = pair.toJson(this.password);
      this.downloadJson({ json, pair });
    },
    downloadJson({ json, pair }) {
      FileSaver.saveAs(
        new Blob([JSON.stringify(json)], {
          type: "application/json; charset=utf-8"
        }),
        `${pair.address}.json`
      );
    }
  }
};
</script>
