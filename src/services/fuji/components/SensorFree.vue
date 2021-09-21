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
      <section>
        <div>
          {{ $t("sensor.isRequest") }}:
          <template v-if="$robonomics.account">
            <RButton v-if="isRequest" color="green" disabled>
              Sign with ethereum account
            </RButton>
            <RButton v-else @click.native="hadlerSend('eth')" color="green">
              Sign with ethereum account
            </RButton>
            &nbsp;
          </template>
          <RButton v-if="isRequest" color="green" disabled>
            Sign with substrate account
          </RButton>
          <RButton v-else @click.native="hadlerSend('substrate')" color="green">
            Sign with substrate account
          </RButton>
        </div>
      </section>
      <div v-if="error" class="red" style="margin: 20px 0">{{ error }}</div>
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
import { Account, Messenger, utils as rUtils } from "robonomics-js";
import Pagination from "./Pagination";
import Message from "./MessageFree";
import Storage from "../utils/storage";
import { parseResult, loadScript } from "../utils/utils";
import config from "~config";
import Modal from "./Modal";
import { Robonomics } from "@/utils/robonomics-substrate";

import utils from "web3-utils";

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
      account: "",
      error: "",
      log: [],
      currentPage: 0,
      storage: new Storage(
        `sn_${this.lighthouse}_${this.model}_${this.agent}_free_fuji`
      )
    };
  },
  mounted() {
    loadScript("https://platform.twitter.com/widgets.js");

    if (!this.$robonomics) {
      return;
    }

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
        let sender;
        if (msg.liability.length === 48) {
          const hash = utils.soliditySha3(
            { type: "string", value: msg.liability },
            {
              type: "bytes",
              value: utils.bytesToHex(rUtils.base58.decode(msg.result))
            },
            { type: "bool", value: msg.success }
          );
          sender = Account.recovery(hash, msg.signature);
        } else {
          sender = Account.recoveryMessage(msg);
        }

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
            msg.liability === this.account)
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
    async hadlerSend(type) {
      this.isRequest = true;
      this.error = "";
      try {
        if (type === "substrate") {
          await this.modalSelectAccount();
        } else {
          this.sendMsgDemand();
        }
      } catch (error) {
        this.error = "Error connected api";
        this.isRequest = false;
      }
    },
    async sendDemand(account) {
      try {
        const demand = {
          model: this.model,
          objective: config.DEFAULT_OBJECTIVE,
          token: this.$robonomics.xrt.address,
          cost: 0,
          lighthouse: this.$robonomics.lighthouse.address,
          validator: "0x0000000000000000000000000000000000000000",
          validatorFee: 0,
          deadline: 0,
          sender: account.address
        };

        this.account = account.address;

        const message = Messenger.create("demand", demand);
        message.signature = await account.signMsg(message.encode());

        this.$robonomics.messenger.channel.send(message.encode());
        this.isRequest = false;
        this.add();
      } catch (error) {
        this.isRequest = false;
      }
    },
    async modalSelectAccount() {
      const robonomics = Robonomics.getInstance("ipci");
      const accounts = robonomics.accountManager.getAccounts();
      if (accounts.length === 0) {
        this.error = "Not found accounts";
        this.isRequest = false;
        return;
      }
      this.$modal.show(
        Modal,
        {
          accounts: accounts,
          onSend: async (address) => {
            const account = await robonomics.accountManager.selectAccountByAddress(
              address
            );
            try {
              await this.sendDemand(account);
            } catch (error) {
              console.log(error);
            }
            this.$modal.hide("modal-select-account");
          }
        },
        { name: "modal-select-account", height: "auto" },
        {
          "before-close": () => {
            this.isRequest = false;
          }
        }
      );
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
            this.account = this.$robonomics.account.address;
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
