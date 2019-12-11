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
      <section>
        <div class="input-size--md">
          <RButton v-if="isRequest" full green>
            {{
            $t("sensor.requested")
            }}
          </RButton>
          <RButton v-else @click.native="sendMsgDemand" full>
            {{
            $t("sensor.isRequest")
            }}
          </RButton>
        </div>
      </section>
      <RWindow v-if="log.length > 0" id="window-sensornetwork-requests">
        <template slot="header">
          <span>
            {{ $t("sensor.requests") }}
            <RButton
              @click.native="clear"
              style="padding: 2px 8px; font-size: 14px; vertical-align: text-top;"
            >{{ $t("sensor.clear") }}</RButton>
          </span>
        </template>
        <RCard v-for="(item, key) in log.slice().reverse()" :key="key">
          <Message :item="item" :lighthouse="lighthouse" :model="model" :agent="agent" />
        </RCard>
      </RWindow>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Message from "./MessageFree";
import history from "./historyStore";
import { parseResult, loadScript } from "./utils";
import config from "~config";

export default {
  props: ["lighthouse", "model", "agent"],
  components: {
    Message
  },
  data() {
    return {
      ready: false,
      isRequest: false,
      log: [],
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
      });

      this.$robonomics.onDemand(this.model, msg => {
        console.log("demand", msg);
      });
      this.$robonomics.onResult(msg => {
        console.log("open", msg);
        // const sender = msg.recovery();
        const sender = this.$robonomics.account.recoveryMessage(msg);
        if (
          this.log.length > 0 &&
          sender.toLowerCase() === this.agent.toLowerCase()
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
