<template>
  <div>
    <h3>Polkadot</h3>
    <div v-if="ready">
      <form v-on:submit.prevent="submit">
        <RFormField>
          <RFieldLabel :isError="fields.sender.error">Sender</RFieldLabel>
          <select
            v-model="fields.sender.value"
            class="container-full"
            :class="{ error: fields.sender.error }"
          >
            <option
              v-for="(account, k) in accounts"
              :key="k"
              :value="account.address"
            >
              {{ account.meta.name }} - {{ account.address.substr(0, 6) }}...{{
                account.address.substr(-6)
              }}
            </option>
          </select>
        </RFormField>
        <RFormField>
          <RFieldLabel :isError="fields.device.error"
            >Device address</RFieldLabel
          >
          <input
            type="text"
            v-model="fields.device.value"
            class="container-full"
            :class="{ error: fields.device.error }"
          />
        </RFormField>
        <RFormField>
          <RFieldLabel :isError="fields.status.error"
            >Device status</RFieldLabel
          >
          <input
            type="checkbox"
            v-model="fields.status.value"
            :class="{ error: fields.status.error }"
            style="border-width: 1px !important; width: 20px; height: 20px"
          />
        </RFormField>
        <button v-if="process" disabled>
          launch
          <div class="loader-ring"></div>
        </button>
        <button v-else type="submit">
          send launch {{ fields.status.value ? "on" : "off" }}
        </button>
        <div v-if="resultWrite" class="mt15">
          <a
            :href="`https://robonomics.subscan.io/extrinsic/${resultWrite.blockNumber}-${resultWrite.txIndex}`"
            target="_blank"
            >View Explorer</a
          >
        </div>
        <div v-if="resultError" class="red mt15">{{ resultError }}</div>
      </form>
      <hr />
      <div v-if="log.length === 0">Not messages</div>
      <div class="items">
        <Pagination
          :listData="log"
          :currentPage="currentPage"
          @page="handlePage"
        >
          <template v-slot:default="props">
            <Row :addr="addr" :value="props.item" />
          </template>
        </Pagination>
      </div>
    </div>
    <div v-else-if="error" class="red">{{ error }}</div>
  </div>
</template>

<script>
import Row from "./Row";
import Pagination from "./Pagination";
import { getInstance } from "@/utils/substrate";
import robonomicsVC from "robonomics-vc";
import { storageDevices } from "../../utils/storage";
import { checkAddress } from "@polkadot/util-crypto";
import config from "../../config";

export default {
  props: ["id"],
  mixins: [robonomicsVC.mixins.form],
  components: {
    Row,
    Pagination
  },
  data() {
    return {
      addr: "",
      log: [],
      currentPage: 0,
      robonomics: null,
      fields: {
        sender: {
          value: "",
          type: "text",
          rules: ["require"],
          error: false
        },
        device: {
          value: "",
          type: "text",
          rules: [
            "require",
            (v) => {
              return checkAddress(v, 32)[0];
            }
          ],
          error: false
        },
        status: {
          value: true,
          type: "checkbox",
          rules: ["require"],
          error: false
        }
      },
      accounts: [],
      resultError: "",
      resultWrite: null,
      process: false,
      listenerDatalog: null,
      ready: false,
      error: ""
    };
  },
  async created() {
    this.$on("onSubmit", this.handleSubmit);
    this.$on("onChange", this.onChange);

    try {
      this.robonomics = await getInstance(config.CHAIN, false);
      this.robonomics.accountManager.onReady((e) => {
        if (e) {
          console.log(e.message);
          return;
        }
        this.loadAccounts();
        this.robonomics.accountManager.onChange((account) => {
          this.fields.sender.value = account.address;
        });
      });
      this.ready = true;
      const items = storageDevices.getItems();
      const idList = this.id;
      this.fields.device.value = items[idList].device || "";
    } catch (error) {
      console.log(error);
      this.error = error.message;
    }
  },
  watch: {
    id: function () {
      if (this.id) {
        const items = storageDevices.getItems();
        const idList = this.id;
        this.fields.device.value = items[idList].device || "";
      }
    }
  },
  destroyed() {
    if (this.listenerDatalog) {
      this.listenerDatalog();
    }
  },
  methods: {
    onChange({ name, fields }) {
      if (name === "device" && this.listenerDatalog) {
        this.listenerDatalog();
      }
      this.validate();
      if (name === "device" && !fields.device.error) {
        this.datalog();
        const items = storageDevices.getItems();
        const list = items[this.id];
        items[this.id]["device"] = this.fields.device.value;
        storageDevices.addItem(this.id, list);
      }
    },
    async loadAccounts() {
      this.accounts = this.robonomics.accountManager.getAccounts();
      if (this.accounts.length) {
        this.fields.sender.value = this.accounts[0].address;
      }
    },
    async datalog() {
      const list = await this.robonomics.datalog.read(this.fields.device.value);
      this.log = list.map((item) => {
        return {
          data: {
            time: item[0].toString(),
            data: item[1].toHuman()
          }
        };
      });
      this.listenerDatalog = await this.robonomics.datalog.on(
        { account: this.fields.device.value },
        (events) => {
          this.log = [
            ...this.log,
            ...events.map((item) => {
              return {
                data: {
                  time: item.moment.toString(),
                  data: item.data.toHuman()
                }
              };
            })
          ];
        }
      );
    },
    handleSubmit(result) {
      if (!result.error) {
        this.launch();
      }
    },
    handlePage(page) {
      this.currentPage = page;
    },
    async launch() {
      try {
        this.process = true;
        this.resultError = "";
        this.resultWrite = null;
        await this.robonomics.accountManager.selectAccountByAddress(
          this.fields.sender.value
        );
        const tx = this.robonomics.launch.send(
          this.fields.device.value,
          this.fields.status.value
        );
        this.resultWrite = await this.robonomics.accountManager.signAndSend(tx);
        this.fields.status.value = !this.fields.status.value;
      } catch (error) {
        console.log(error);
        this.fields.status.value = true;
        this.resultError = error.message;
      }
      this.process = false;
    }
  }
};
</script>

<style scoped>
.items {
  margin: 10px 0;
}
.btns {
  text-align: right;
}
.btns button {
  margin-left: 10px;
}
</style>
