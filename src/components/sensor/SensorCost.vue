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
        <Approve
          v-if="Number(cost) > 0 && token"
          :address="token"
          :cost="Number(cost)"
          :onFetch="onAllowance"
        />
        <div v-if="allowance >= Number(cost)" class="input-size--md">
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
import { Liability } from "robonomics-js";
import Approve from "@/components/approve/Main";
import Message from "./MessageCost";
import history from "./historyStore";
import { parseResult, loadScript } from "./utils";
import config from "~config";

export default {
  props: ["lighthouse", "model", "agent", "token", "cost"],
  components: {
    Message,
    Approve
  },
  data() {
    return {
      ready: false,
      isRequest: false,
      log: [],
      storeKey: `sn_${this.lighthouse}_${this.model}_${this.agent}_cost`,
      allowance: 0
    };
  },
  mounted() {
    loadScript("https://platform.twitter.com/widgets.js");

    this.$robonomics.initLighthouse(this.lighthouse).then(() => {
      this.ready = true;

      const data = history.getData(this.storeKey);
      this.log = data;
      data.forEach((item, index) => {
        Vue.set(this.log, index, {
          ...this.log[index]
        });
        if (item.status > 1) {
          const liability = new Liability(
            this.$robonomics.web3,
            item.liability
          );
          if (item.status === 2) {
            liability
              .result()
              .then(r => {
                if (r) {
                  return r;
                }
                return liability.onResult();
              })
              .then(result => {
                console.log(result);
                Vue.set(this.log, index, {
                  ...this.log[index],
                  status: 3,
                  resultHash: result
                });
                history.addItem(
                  this.storeKey,
                  {
                    ...this.log[index],
                    status: 3,
                    resultHash: result
                  },
                  index
                );
                parseResult(result).then(result => {
                  Vue.set(this.log, index, {
                    ...this.log[index],
                    status: 4,
                    result: result
                  });
                  history.addItem(
                    this.storeKey,
                    {
                      ...this.log[index],
                      status: 4,
                      result: result
                    },
                    index
                  );
                });
              })
              .catch(e => {
                this.isRequest = false;
                console.log(e);
              });
          } else if (item.status === 3) {
            parseResult(item.resultHash).then(result => {
              Vue.set(this.log, index, {
                ...this.log[index],
                status: 4,
                result: result
              });
              history.addItem(
                this.storeKey,
                {
                  ...this.log[index],
                  status: 4,
                  result: result
                },
                index
              );
            });
          }
        }
      });

      this.$robonomics.onDemand(this.model, msg => {
        console.log("demand", msg);
      });
      this.$robonomics.onOffer(this.model, msg => {
        console.log("offer", msg);
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
          token: this.token,
          cost: this.cost,
          lighthouse: this.$robonomics.lighthouse.address,
          validator: "0x0000000000000000000000000000000000000000",
          validatorFee: 0,
          deadline: r.number + 1000
        };
        let liabilityWatch;
        this.$robonomics
          .sendDemand(demand, true, () => {
            this.isRequest = false;
            const item = {
              status: 1,
              time: new Date().toLocaleString()
            };
            this.log.push(item);
          })
          .then(liability => {
            console.log(liability.address);
            liabilityWatch = liability.address;

            const index = this.log.findIndex(item => item.status === 1);
            Vue.set(this.log, index, {
              ...this.log[index],
              status: 2,
              liability: liability.address
            });
            history.addItem(
              this.storeKey,
              {
                ...this.log[index],
                status: 2,
                liability: liability.address
              },
              index
            );
            return liability.onResult();
          })
          .then(result => {
            console.log(result);
            const index = this.log.findIndex(
              item => item.liability === liabilityWatch
            );
            Vue.set(this.log, index, {
              ...this.log[index],
              status: 3,
              resultHash: result
            });
            history.addItem(
              this.storeKey,
              {
                ...this.log[index],
                status: 3,
                resultHash: result
              },
              index
            );
            parseResult(result).then(result => {
              Vue.set(this.log, index, {
                ...this.log[index],
                status: 4,
                result: result
              });
              history.addItem(
                this.storeKey,
                {
                  ...this.log[index],
                  status: 4,
                  result: result
                },
                index
              );
            });
          })
          .catch(e => {
            this.isRequest = false;
            console.log(e);
          });
      });
    },
    onAllowance({ allowance }) {
      this.allowance = Number(allowance);
    },
    clear() {
      history.removeItem(this.storeKey);
      this.log = [];
    }
  }
};
</script>
