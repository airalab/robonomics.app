<template>
  <div>
    <h3>Polkadot</h3>
    <div v-if="ready">
      <form v-on:submit.prevent="submit">
        <RFormField>
          <RFieldLabel :isError="fields.subscription.error"
            >Subscription</RFieldLabel
          >
          <select
            v-model="fields.subscription.value"
            class="container-full"
            :class="{ error: fields.subscription.error }"
          >
            <option
              v-for="(item, k) in subscriptions"
              :key="k"
              :value="item.subscription"
            >
              {{ item.subscription.substr(0, 6) }}...{{
                item.subscription.substr(-6)
              }}
            </option>
          </select>
        </RFormField>
        <RFormField>
          <RFieldLabel :isError="fields.sender.error">Sender</RFieldLabel>
          <select
            v-model="fields.sender.value"
            class="container-full"
            :class="{ error: fields.sender.error }"
          >
            <option
              v-for="(device, k) in devices"
              :key="k"
              :value="device.address"
            >
              {{ device.name }} - {{ device.address.substr(0, 6) }}...{{
                device.address.substr(-6)
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
import Storage from "@/utils/storage";

export const devicesStore = new Storage("rws-devices");

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
        subscription: {
          value: "",
          type: "text",
          rules: ["require"],
          error: false
        },
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
      subscriptions: [],
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
        this.loadSubscriptions();
        // this.robonomics.accountManager.onChange((account) => {
        //   this.fields.sender.value = account.address;
        // });
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
  computed: {
    devices: function () {
      const subscription = this.subscriptions.find((item) => {
        return item.subscription === this.fields.subscription.value;
      });
      if (subscription) {
        const devicesStoreItems =
          devicesStore.getItems()[subscription.subscription] || [];
        return subscription.devices.map((item) => {
          return {
            name:
              devicesStoreItems.find(
                (device) => device.address === item.toString()
              ).name || "",
            address: item.toString()
          };
        });
      }
      return [];
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
    async loadSubscriptions() {
      const accounts = this.robonomics.accountManager.getAccounts();
      for (const account of accounts) {
        const ledger = await this.robonomics.rws.getLedger(account.address);
        if (!ledger.isNone) {
          const devices = await this.robonomics.rws.getDevices(account.address);
          this.subscriptions.push({
            subscription: account.address,
            devices
          });
        }
      }
      if (this.subscriptions.length) {
        this.fields.subscription.value = this.subscriptions[0].subscription;
        this.fields.sender.value = this.subscriptions[0].devices[0].toString();
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
        const call = this.robonomics.launch.send(
          this.fields.device.value,
          this.fields.status.value
        );
        const tx = this.robonomics.rws.call(
          this.fields.subscription.value,
          call
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
