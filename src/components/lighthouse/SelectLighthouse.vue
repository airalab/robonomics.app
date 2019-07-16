<template>
  <fragment>
    <section>
      <h2>Connect to lighthouse</h2>
      <div class="input-size--lg">
        <select id="select-lighthouseConnect"></select>
      </div>
    </section>
    <section id="lighthouse-connection"></section>
    <button
      v-if="!createForm"
      class="btn-green"
      v-on:click="connect"
      :disabled="
              lighthouseAddr.length == 0 ||
              lighthouseAddr == '0x0000000000000000000000000000000000000000'
            "
    >Connect</button>

    <div v-show="createForm">
      <p>
        <label class="t-sm">Name of the lighthouse</label>
        <br>
        <input
          type="text"
          v-model="form.name"
          @input="form.name = $event.target.value.toLowerCase().split('.')[0]"
          class="input-size--lg"
        >
      </p>
      <p>
        <label class="t-sm">Minimal stake to get one quota (XRT)</label>
        <br>
        <input
          type="number"
          v-model="form.minimalStake"
          @input="form.minimalStake = Number($event.target.value)"
          class="input-size--md"
        >
      </p>
      <p>
        <label class="t-sm">Silence timeout for provider in blocks</label>
        <br>
        <input
          type="number"
          v-model="form.timeoutInBlocks"
          @input="form.timeoutInBlocks = Number($event.target.value)"
          class="input-size--sm"
        >
      </p>
      <button class="btn-green" disabled v-if="create">Create lighthouse and connect to the network</button>
      <button
        class="btn-green"
        v-on:click="sendCreateLighthouse"
        v-else
      >Create lighthouse and connect to the network</button>
      <span v-if="createMsg">{{ createMsg }}</span>
    </div>
  </fragment>
</template>

<script>
import { toWei } from "../../utils/utils";

let slim;

export default {
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
      createMsg: ""
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
        valuesUseText: false, // Use text instead of innerHTML for selected values - default false
        data: [
          { placeholder: true, text: "Choose lighthouse" },
          {
            innerHTML: "<b>New lighthouse</b>",
            text: "create new lighthouse",
            value: "new",
            class: "type-new"
          }
        ],
        onChange: info => {
          if (info.class == "type-new") {
            this.createForm = true;
            document.querySelectorAll("#lighthouse-connection")[0].innerHTML =
              "";
          } else {
            this.createForm = false;
            this.selectLighthouse(info.value);
            document.querySelectorAll("#lighthouse-connection")[0].innerHTML =
              info.innerHTML;
          }
        }
      });
    },
    fetchData() {
      this.getLighthouses().then(lighthouses => {
        if (lighthouses.length > 0) {
          this.lighthouse = lighthouses[0].name;
          this.lighthouseAddr = lighthouses[0].addr;
          const navData = [{ placeholder: true, text: "Choose lighthouse" }];
          lighthouses.forEach(item => {
            this.lighthouses.push(item);
            navData.push({
              text: item.name,
              value: item.name,
              innerHTML:
                "<b>" +
                item.name +
                '</b>&nbsp;<br/><span class="t-small">' +
                item.addr +
                "</span>"
            });
          });
          navData.push({
            innerHTML: "<b>New lighthouse</b>",
            text: "create new lighthouse",
            value: "new",
            class: "type-new"
          });
          slim.setData(navData);
        }
      });
    },
    getLighthouses(options = { fromBlock: 0, toBlock: "latest" }) {
      return new Promise((resolve, reject) => {
        this.$robonomics.factory.contract
          .NewLighthouse({}, options)
          .get((error, result) => {
            if (!error) {
              const lighthouses = [];
              result.forEach(item => {
                lighthouses.push({
                  name: this.$robonomics.ens.getUrl(
                    item.args.name,
                    "lighthouse"
                  ),
                  addr: item.args.lighthouse
                });
              });
              resolve(lighthouses);
            } else {
              reject(error);
            }
          });
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
                addr: this.$robonomics.web3.toChecksumAddress(
                  lighthouse.address
                )
              });
              this.created = true;
              this.create = false;
              this.selectLighthouse(
                this.$robonomics.ens.getUrl(lighthouse.name, "lighthouse")
              ).then(() => {
                watcher.stopWatching();
                this.connect();
              });
            }
          }
        );
        this.$robonomics.factory.send
          .createLighthouse(
            toWei(this.form.minimalStake, 9),
            this.form.timeoutInBlocks,
            this.form.name,
            {
              from: this.$robonomics.account.address
            }
          )
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
        this.$router.push({ path: `/lighthouse/${this.lighthouse}` });
      }
    }
  }
};
</script>
