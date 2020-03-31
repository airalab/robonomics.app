<template>
  <div>
    <div v-if="ready">
      <h4>
        {{ $t("sensor.statusAgent") }}:
        <template
          v-if="log.length === 0"
        >{{ $t("sensor.notStatusAgent") }}</template>
        <template v-else>
          {{ $t("sensor.yesStatusAgent") }}
          {{ log[log.length - 1].time }}
        </template>
      </h4>
      <section v-if="$robonomics.account">
        <div class="input-size--md">
          <RButton v-if="isRequest" full green disabled>
            {{
            $t("sensor.requested")
            }}
          </RButton>
          <RButton v-else @click.native="sendMsgDemand" full green>
            {{
            $t("sensor.isRequest")
            }}
          </RButton>
        </div>
      </section>
      <RWindow v-if="log.length > 0" id="window-sensornetwork-requests">
        <template slot="header">
          <span>
            {{ $t("sensor.requests") }} ({{ log.length }})
            <RButton
              @click.native="clear"
              style="background:none;color:#03a5ed;border:2px solid #03a5ed;padding-top:2px;padding-bottom:2px;margin-left:15px;"
            >{{ $t("sensor.clear") }}</RButton>
          </span>
        </template>

        <Pagination
          :listData="log.slice().reverse()"
          :currentPage="currentPage"
          @onPage="handlePage"
        >
          <template v-slot:default="props">
            <RCard>
              <Message :item="props.item" :lighthouse="lighthouse" :model="model" :agent="agent" />
            </RCard>
          </template>
        </Pagination>
      </RWindow>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Account } from "robonomics-js";
import Pagination from "./Pagination";
import Message from "./MessageFree";
import history from "../utils/historyStore";
import { parseResult, loadScript } from "../utils/utils";
import config from "~config";

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
      storeKey: `sn_${this.lighthouse}_${this.model}_${this.agent}_free`
    };
  },
  mounted() {
    loadScript("https://platform.twitter.com/widgets.js");

    if (this.$robonomics.messenger) {
      this.$robonomics.messenger.stop();
    }
    this.$robonomics.initLighthouse(this.lighthouse).then(() => {
      this.ready = true;

      const data = history.getData(this.storeKey).filter(item => item);
      this.log = data;
      console.log("load", data);
      data.forEach((item, index) => {
        if (
          item &&
          Object.prototype.hasOwnProperty.call(item, "status") &&
          item.status >= 2
        ) {
          parseResult(item.resultHash).then(result => {
            Vue.set(this.log, index, {
              ...this.log[index],
              status: 3,
              result: result
            });
            history.addItem(
              this.storeKey,
              {
                ...this.log[index],
                status: 3,
                result: result
              },
              index
            );
          });
        }
      });

      this.$robonomics.onDemand(this.model, msg => {
        console.log("demand", msg);
      });
      this.$robonomics.onResult(msg => {
        console.log("open", msg);
        // const sender = msg.recovery();
        const sender = Account.recoveryMessage(msg);

        if (
          sender.toLowerCase() === this.agent.toLowerCase() &&
          msg.liability === "0x0000000000000000000000000000000000000000"
        ) {
          const item = {
            status: 1,
            time: new Date().toLocaleString()
          };
          this.log.push(item);
          if (this.currentPage > 0) {
            this.currentPage += 1;
          }
        }

        if (
          this.log.length > 0 &&
          sender.toLowerCase() === this.agent.toLowerCase() &&
          (msg.liability === "0x0000000000000000000000000000000000000000" ||
            (this.$robonomics.account &&
              msg.liability === this.$robonomics.account.address))
        ) {
          const index = this.log.findIndex(item => item.status === 1);
          Vue.set(this.log, index, {
            ...this.log[index],
            status: 2,
            resultHash: msg.result
          });
          history.addItem(
            this.storeKey,
            {
              ...this.log[index],
              status: 2,
              resultHash: msg.result
            },
            index
          );

          parseResult(msg.result).then(result => {
            Vue.set(this.log, index, {
              ...this.log[index],
              status: 3,
              result: result
            });
            history.addItem(
              this.storeKey,
              {
                ...this.log[index],
                status: 3,
                result: result
              },
              index
            );
          });
        }
      });
    });
  },
  methods: {
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
            const item = {
              status: 1,
              time: new Date().toLocaleString()
            };
            this.log.push(item);
            if (this.currentPage > 0) {
              this.currentPage += 1;
            }
          })
          .catch(e => {
            this.isRequest = false;
            console.log(e);
          });
      });
    },
    clear() {
      history.removeItem(this.storeKey);
      this.log = [];
    }
  }
};
</script>
