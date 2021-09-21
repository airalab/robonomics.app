<template>
  <div>
    <div v-if="ready">
      <h4>
        {{ $t("sensor.statusAgent") }}:
        <template v-if="log.length === 0">{{
          $t("sensor.notStatusAgent")
        }}</template>
        <template v-else>
          {{ $t("sensor.yesStatusAgent") }}
          {{ log[log.length - 1].create_time }}
        </template>
      </h4>
      <section v-if="$robonomics.account">
        <div class="input-size--md">
          <RButton v-if="isRequest" fullWidth color="green" disabled>{{
            $t("sensor.requested")
          }}</RButton>
          <RButton
            v-else
            @click.native="sendMsgDemand"
            fullWidth
            color="green"
            >{{ $t("sensor.isRequest") }}</RButton
          >
        </div>
      </section>
      <RWindow v-if="log.length > 0" id="window-sensornetwork-requests">
        <template slot="header">
          <span>
            {{ $t("sensor.requests") }} ({{ log.length }})
            <RButton
              @click.native="clear"
              style="
                background: none;
                color: #03a5ed;
                border: 2px solid #03a5ed;
                padding-top: 2px;
                padding-bottom: 2px;
                margin-left: 15px;
              "
              >{{ $t("sensor.clear") }}</RButton
            >
          </span>
        </template>

        <Pagination
          :listData="log"
          :currentPage="currentPage"
          @on-page="handlePage"
        >
          <template v-slot:default="props">
            <RCard>
              <Message
                :item="props.item"
                :lighthouse="lighthouse"
                :model="model"
                :agent="agent"
              />
            </RCard>
          </template>
        </Pagination>
      </RWindow>
    </div>
  </div>
</template>

<script>
import { Account } from "robonomics-js";
import Pagination from "./Pagination";
import Message from "./MessageFree";
import Storage from "../utils/storage";
import { parseResult, loadScript } from "../utils/utils";
import config from "~config";

const MAX_ROW_HISTORY = 100;

export default {
  props: ["lighthouse", "model", "agent"],
  components: {
    Pagination,
    Message
  },
  data() {
    return {
      ready: false,
      isRequest: false,
      log: [],
      currentPage: 0,
      storage: new Storage(
        `sn_${this.lighthouse}_${this.model}_${this.agent}_free_v1`
      )
    };
  },
  mounted() {
    loadScript("https://platform.twitter.com/widgets.js");

    if (this.$robonomics.messenger) {
      this.$robonomics.messenger.stop();
    }
    this.$robonomics.initLighthouse(this.lighthouse).then(() => {
      this.ready = true;
      this.upLog();

      this.log.forEach((item) => {
        if (item.status === 2) {
          parseResult(item.resultHash).then((result) => {
            this.upadte(item.id, {
              status: 3,
              result: result
            });
          });
        }
      });

      this.$robonomics.onDemand(this.model, (msg) => {
        console.log("demand", msg);
      });

      this.$robonomics.onResult((msg) => {
        const sender = Account.recoveryMessage(msg);
        console.log("open", msg, sender);

        if (
          sender.toLowerCase() === this.agent.toLowerCase() &&
          msg.liability === "0x0000000000000000000000000000000000000000"
        ) {
          this.add();
        }

        if (
          sender.toLowerCase() === this.agent.toLowerCase() &&
          (msg.liability === "0x0000000000000000000000000000000000000000" ||
            (this.$robonomics.account &&
              msg.liability === this.$robonomics.account.address))
        ) {
          const id = this.findId((item) => item.status === 1);
          if (id) {
            this.upadte(id, {
              status: 2,
              resultHash: msg.result
            });
            parseResult(msg.result).then((result) => {
              this.upadte(id, {
                status: 3,
                result: result
              });
            });
          }
        }
      });
    });
  },
  methods: {
    upLog() {
      const items = this.storage.getItems();
      const keys = Object.keys(items);
      const removing = keys.length - MAX_ROW_HISTORY;
      if (removing > 0) {
        for (let index = 0; index < removing; index++) {
          delete items[keys[index]];
        }
        this.storage.saveItems(items);
      }
      this.log = Object.values(items).reverse();
    },
    add() {
      const item = {
        id: Date.now(),
        create_time: new Date().toLocaleString(),
        update_time: new Date().toLocaleString(),
        status: 1
      };
      this.storage.addItem(item.id, item);
      this.upLog();
      if (this.currentPage > 0 && this.currentPage < this.log.length - 1) {
        this.currentPage += 1;
      }
    },
    findId(filter) {
      const items = this.storage.getItems();
      const keys = Object.keys(items);
      const index = keys.findIndex((key) => filter(items[key]));
      if (index >= 0) {
        return keys[index];
      }
      return false;
    },
    upadte(id, data) {
      const items = this.storage.getItems();
      const item = {
        ...items[id],
        ...data,
        update_time: new Date().toLocaleString()
      };
      this.storage.addItem(item.id, item);
      this.upLog();
    },
    handlePage(page) {
      this.currentPage = page;
    },
    sendMsgDemand() {
      this.isRequest = true;
      this.$robonomics.web3.eth.getBlock("latest", (e, r) => {
        const demand = {
          model: this.model,
          objective: config.DEFAULT_OBJECTIVE,
          token: this.$robonomics.xrt.address,
          cost: 0,
          lighthouse: this.$robonomics.lighthouse.address,
          validator: "0x0000000000000000000000000000000000000000",
          validatorFee: 0,
          deadline: r.number + 1000
        };
        this.$robonomics
          .sendDemand(demand, false, () => {
            this.isRequest = false;
            this.add();
          })
          .catch((e) => {
            this.isRequest = false;
            console.log(e);
          });
      });
    },
    clear() {
      this.storage.clear();
      this.log = [];
      this.currentPage = 0;
    }
  }
};
</script>
