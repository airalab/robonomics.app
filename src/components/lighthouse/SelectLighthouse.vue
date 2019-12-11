<template>
  <div class="input-size--lg">
    <select id="select-lighthouseConnect"></select>
    <div v-if="createForm" class="m-t-5">
      <p>
        <label class="t-sm">Name of the lighthouse</label>
        <br />
        <input
          type="text"
          v-model="form.name"
          @input="form.name = $event.target.value.toLowerCase().split('.')[0]"
          class="input-size--lg"
        />
      </p>
      <p>
        <label class="t-sm">Minimal stake to get one quota (XRT)</label>
        <br />
        <input
          type="number"
          v-model="form.minimalStake"
          @input="form.minimalStake = Number($event.target.value)"
          class="input-size--md"
        />
      </p>
      <p>
        <label class="t-sm">Silence timeout for provider in blocks</label>
        <br />
        <input
          type="number"
          v-model="form.timeoutInBlocks"
          @input="form.timeoutInBlocks = Number($event.target.value)"
          class="input-size--sm"
        />
      </p>
      <RButton green disabled v-if="create">Create and connect</RButton>
      <RButton green @click.native="sendCreateLighthouse" v-else>Create and connect</RButton>
      <a href="javascript:;" class="m-l-20" @click="reset">Cancel</a>
      <div v-if="createMsg">{{ createMsg }}</div>
    </div>
    <div v-if="isBtnConnect" class="m-t-5">
      <RButton @click.native="connect">Connect</RButton>
      <a href="javascript:;" class="m-l-20" @click="reset">Cancel</a>
    </div>
  </div>
</template>

<script>
import { number } from "../../RComponents/tools/utils";

let slim;

export default {
  props: {
    isCreate: {
      type: Boolean,
      default: true
    },
    selectedLighthouse: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      lighthouse: "",
      lighthouseAddr: "",
      lighthouses: [],
      form: {
        name: "",
        minimalStake: 0.000001,
        timeoutInBlocks: 25
      },
      createForm: false,
      create: false,
      created: false,
      createMsg: "",
      isBtnConnect: false
    };
  },
  mounted() {
    this.slim();
    return this.fetchData();
  },
  methods: {
    slim() {
      slim = new SlimSelect({
        select: "#select-lighthouseConnect",
        data: [{ placeholder: true, text: "Choose lighthouse" }],
        onChange: info => {
          this.old = this.createForm = false;
          this.isBtnConnect = false;
          if (info.class == "type-new") {
            this.createForm = true;
          } else {
            this.isBtnConnect = true;
            this.selectLighthouse(info.value);
          }
        }
      });
    },
    reset() {
      slim.set(this.selectedLighthouse);
      this.createForm = false;
      this.isBtnConnect = false;
    },
    fetchData() {
      this.getLighthouses().then(lighthouses => {
        if (lighthouses.length > 0) {
          // this.lighthouse = lighthouses[0].name;
          // this.lighthouseAddr = lighthouses[0].addr;
          this.selectLighthouse(lighthouses[0].name);
          const navData = [
            {
              placeholder: true,
              text: "Choose lighthouse"
            }
          ];
          lighthouses.forEach(item => {
            this.lighthouses.push(item);
            navData.push({
              label: item.name,
              options: [
                {
                  innerHTML: item.addr,
                  text: item.addr,
                  value: item.name,
                  selected: false
                }
              ]
            });
          });
          if (this.isCreate) {
            navData.push({
              label: "New lighthouse",
              options: [
                {
                  innerHTML: "create new lighthouse",
                  text: "create new lighthouse",
                  value: "new",
                  class: "type-new"
                }
              ]
            });
          }
          slim.setData(navData);

          slim.set(
            this.selectedLighthouse
              ? this.selectedLighthouse
              : lighthouses[0].name
          );
          if (this.selectedLighthouse) {
            this.createForm = false;
            this.isBtnConnect = false;
          }
        }
      });
    },
    getLighthouses(options = { fromBlock: 0, toBlock: "latest" }) {
      return new Promise((resolve, reject) => {
        this.$robonomics.factory.getPastEvents(
          "NewLighthouse",
          options,
          (error, result) => {
            if (!error) {
              const lighthouses = [];
              result.forEach(item => {
                lighthouses.push({
                  name: this.$robonomics.ens.getUrl(
                    item.returnValues.name,
                    "lighthouse"
                  ),
                  addr: item.returnValues.lighthouse
                });
              });
              resolve(lighthouses);
            } else {
              reject(error);
            }
          }
        );
      });
    },
    async searchLighthouse() {
      this.lighthouse = this.$robonomics.ens.getUrl(
        this.lighthouse,
        "lighthouse"
      );
      this.lighthouseAddr = await this.$robonomics.ens.addrLighthouse(
        this.lighthouse
      );
    },
    selectLighthouse(name) {
      this.lighthouse = name;
      return this.searchLighthouse();
    },
    async sendCreateLighthouse() {
      if (!(this.form.minimalStake > 0)) {
        this.createMsg = "Error: Minimal stake value 1";
        return;
      }
      if (!(this.form.timeoutInBlocks > 0)) {
        this.createMsg = "Error: Minimal timeout value 1";
        return;
      }
      const existLighthouseAddr = await this.$robonomics.ens.addrLighthouse(
        this.form.name
      );
      this.createMsg = "";
      if (this.form.name === "") {
        this.createMsg = "Error: Require name lighthouse";
      } else if (
        existLighthouseAddr !== "0x0000000000000000000000000000000000000000"
      ) {
        this.createMsg = "Error: Exist name lighthouse";
      } else {
        this.create = true;
        const watcher = this.$robonomics.factory.onLighthouse(
          (error, lighthouse) => {
            console.log("lighthouse", lighthouse.address, lighthouse.name);
            if (lighthouse.name === this.form.name) {
              this.lighthouses.push({
                name: this.$robonomics.ens.getUrl(
                  lighthouse.name,
                  "lighthouse"
                ),
                addr: this.$robonomics.web3.utils.toChecksumAddress(
                  lighthouse.address
                )
              });
              this.created = true;
              this.create = false;
              this.selectLighthouse(
                this.$robonomics.ens.getUrl(lighthouse.name, "lighthouse")
              ).then(() => {
                watcher.unsubscribe();
                this.connect();
              });
            }
          }
        );
        this.$robonomics.factory.methods
          .createLighthouse(
            number.toWei(this.form.minimalStake, 9),
            this.form.timeoutInBlocks,
            this.form.name
          )
          .send({
            from: this.$robonomics.account.address
          })
          .then(tx => {
            console.log("tx", tx);
          })
          .catch(e => {
            console.log(e);
            this.create = false;
          });
      }
    },
    connect() {
      if (this.lighthouse !== "") {
        this.$emit("connect", this.lighthouse);
      }
    }
  }
};
</script>
