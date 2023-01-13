<template>
  <robo-section>
    <robo-card :disabled="!controller">
      <robo-card-label>
        <robo-card-label-section>Get telemetry</robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <robo-card-title
          size="3"
          offset="x05"
          tooltip="You may insert your gateway for faster download (e.g. https://gateway.pinata.cloud/). Do it only if you know how it works."
          tooltipIcon="circle-question"
        >
          IPFS gateway (extended)
        </robo-card-title>

        <robo-section offset="x05">
          <robo-select
            :options="gateways"
            :values="gateways"
            v-model="selectedGateway"
            block
            :disabled="selectedIndex >= 0 && log[selectedIndex].load"
          />
        </robo-section>

        <robo-section v-if="selectedGateway === 'other'" offset="x05">
          <robo-input
            v-model="gateway"
            placeholder="Enter gateway url"
            :disabled="selectedIndex >= 0 && log[selectedIndex].load"
          />
        </robo-section>

        <robo-section offset="x05">
          <robo-select
            :options="dates"
            :values="ids"
            v-model="selected"
            block
            :disabled="selectedIndex >= 0 && log[selectedIndex].load"
          />
        </robo-section>
        <robo-section
          v-if="selectedIndex >= 0 && this.log[this.selectedIndex].hash"
          offset="x05"
        >
          <small>
            <a
              :href="`${this.gateway}ipfs/${this.log[this.selectedIndex].hash}`"
              target="_blank"
            >
              {{ `${this.gateway}ipfs/${this.log[this.selectedIndex].hash}` }}
            </a>
          </small>
        </robo-section>

        <robo-section offset="x05">
          <robo-button
            block
            @click="download"
            :disabled="canDownload"
            :loading="selectedIndex >= 0 && log[selectedIndex].load"
          >
            Download telemetry
          </robo-button>
          <robo-notification
            v-if="selectedIndex >= 0 && log[selectedIndex].error"
            :title="log[selectedIndex].error"
            type="error"
          />
        </robo-section>
      </robo-card-section>
    </robo-card>
  </robo-section>
</template>

<script>
import { u8aToString } from "@polkadot/util";
import { encodeAddress } from "@polkadot/util-crypto";
import { catFile } from "../../plugins/ipfs";
import robonomics from "../../robonomics";

export default {
  props: ["controller"],
  emits: ["telemetry"],
  data() {
    return {
      gateways: [
        "other",
        "https://ipfs.io/",
        "https://gateway.ipfs.io/",
        "https://cloudflare-ipfs.com/",
        "https://cf-ipfs.com/",
        "https://ipfs-gateway.cloud/",
        "https://jorropo.net/",
        "https://gateway.pinata.cloud/"
      ],
      selectedGateway: "https://ipfs.io/",
      gateway: "https://ipfs.io/",
      log: [],
      selected: ""
    };
  },
  created() {
    this.read();
  },
  watch: {
    controller() {
      this.read();
    },
    selectedGateway() {
      if (this.selectedGateway === "other") {
        this.gateway = "";
      } else {
        this.gateway = this.selectedGateway;
      }
    }
  },
  computed: {
    canDownload() {
      return (
        this.selectedIndex < 0 ||
        !this.log[this.selectedIndex].hash ||
        this.log[this.selectedIndex].load ||
        !!this.log[this.selectedIndex].data
      );
    },
    dates() {
      return this.log.map((item) => item.date);
    },
    ids() {
      return this.log.map((item) => item.id);
    },
    selectedIndex() {
      return this.log.findIndex((item) => item.id === this.selected);
    }
  },
  methods: {
    async read() {
      if (!this.controller) {
        this.log = [];
        this.selected = "";
        return;
      }

      const log = await robonomics.datalog.read(
        encodeAddress(this.controller.address, 32)
      );
      this.log = log.reverse().map((item, i) => {
        let hash = item[1].toHuman();
        let data = null;
        if (hash.substring(0, 2) === "Qm") {
          data = null;
        } else {
          try {
            data = JSON.parse(hash);
          } catch (_) {
            data = hash;
          }
          hash = null;
        }
        return {
          id: i + 1,
          date: new Date(item[0].toNumber()).toLocaleString(),
          hash: hash,
          data: data,
          load: false,
          error: false
        };
      });
      if (this.log.length) {
        this.selected = this.log[0].id;
      }
    },
    async download() {
      if (this.selectedIndex < 0) {
        return;
      }
      if (this.log[this.selectedIndex].data) {
        this.$emit("telemetry", this.log[this.selectedIndex].data);
        return;
      }
      if (!this.log[this.selectedIndex].hash) {
        return;
      }
      this.log[this.selectedIndex].error = false;
      this.log[this.selectedIndex].load = true;
      let result;
      try {
        result = await catFile(this.log[this.selectedIndex].hash, this.gateway);
      } catch (error) {
        console.log(error);
        this.log[this.selectedIndex].load = false;
        this.log[this.selectedIndex].error =
          "Data fetch error. Try changing ipfs gateway.";
      }
      if (result) {
        console.log(result);
        try {
          const data = this.decrypt(result);
          if (data) {
            this.log[this.selectedIndex].data = data;
          } else {
            this.log[this.selectedIndex].data = result;
          }
          this.log[this.selectedIndex].load = false;
        } catch (error) {
          console.log(error);
          this.log[this.selectedIndex].load = false;
          this.log[this.selectedIndex].error = "Data decryption error.";
        }
      }
      this.$emit("telemetry", this.log[this.selectedIndex].data);
    },
    decrypt(encryptMessage) {
      const decryptMessage = this.controller.decryptMessage(
        encryptMessage,
        this.controller.publicKey
      );
      return u8aToString(decryptMessage);
    }
  }
};
</script>
