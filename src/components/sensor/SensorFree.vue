<template>
  <div>
    <div v-if="ready">
      <h4>
        {{ $t("sensor.statusAgent") }}:
        <template v-if="log.length === 0">
          {{
          $t("sensor.notStatusAgent")
          }}
        </template>
        <template v-else>
          {{ $t("sensor.yesStatusAgent") }}
          {{ log[log.length - 1].time }}
        </template>
      </h4>
      <section v-if="model !== 'Qmczm9hw8SjGmtx55t6MJPQTtXQDuS9grqaTb18Sv8b6pm'">
        <div class="input-size--md">
          <RButton v-if="isRequest" full green disabled>{{ $t("sensor.requested") }}</RButton>
          <RButton v-else @click.native="sendMsgDemand" full green>{{ $t("sensor.isRequest") }}</RButton>
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
      <RCard v-else-if="model === 'Qmczm9hw8SjGmtx55t6MJPQTtXQDuS9grqaTb18Sv8b6pm'">
        <span class="align-vertical">{{ $t("sensor.wait") }}</span>
        <div class="loader-ring align-vertical m-l-10"></div>
      </RCard>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Pagination from "./Pagination";
import Message from "./MessageFree";
import history from "./historyStore";
import { parseResult, loadScript } from "./utils";
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

    this.$robonomics.initLighthouse(this.lighthouse).then(() => {
      this.ready = true;

      const data = history.getData(this.storeKey);
      this.log = data;
      data.forEach((item, index) => {
        if (
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
        // const sender = msg.recovery();
        const sender = this.$robonomics.account.recoveryMessage(msg);
        console.log("open", sender, msg);

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
            msg.liability === this.$robonomics.account.address)
        ) {
          const index = this.log.findIndex(item => item.status === 1);
          Vue.set(this.log, index, {
            ...this.log[index],
            status: 2,
            resultHash: msg.result
          });
          history.addItem(this.storeKey, {
            ...this.log[index],
            status: 2,
            resultHash: msg.result
          });

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
