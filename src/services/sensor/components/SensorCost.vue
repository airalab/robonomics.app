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
        <Approve
          v-if="Number(cost) > 0 && tokenAddress"
          :address="tokenAddress"
          :from="$robonomics.account.address"
          :to="$robonomics.factory.address"
          :initAmountWei="cost"
          :alwaysShow="false"
        />
        <div v-if="Number(myAllowance) >= Number(cost)" class="input-size--md">
          <RButton v-if="isRequest" fullWidth color="green" disabled>
            {{
            $t("sensor.requested")
            }}
          </RButton>
          <RButton
            v-else
            @click.native="sendMsgDemand"
            fullWidth
            color="green"
          >{{ $t("sensor.isRequest") }}</RButton>
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

        <Pagination :listData="log" :currentPage="currentPage" @onPage="handlePage">
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
import { Liability } from "robonomics-js";
import Approve from "@/components/approve/Main";
import token from "@/mixins/token";
import Pagination from "./Pagination";
import Message from "./MessageCost";
import Storage from "../utils/storage";
import { parseResult, loadScript } from "../utils/utils";
import config from "~config";

const MAX_ROW_HISTORY = 100;

export default {
  mixins: [token],
  props: ["lighthouse", "model", "agent", "tokenAddress", "cost"],
  components: {
    Pagination,
    Message,
    Approve
  },
  data() {
    return {
      ready: false,
      isRequest: false,
      log: [],
      currentPage: 0,
      storage: new Storage(
        `sn_${this.lighthouse}_${this.model}_${this.agent}_cost_v1`
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

      this.log.forEach(item => {
        if (item.status === 2) {
          const liability = new Liability(
            this.$robonomics.web3,
            item.liability
          );
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
              this.upadte(item.id, {
                status: 3,
                resultHash: result
              });
              parseResult(result).then(result => {
                this.upadte(item.id, {
                  status: 4,
                  result: result
                });
              });
            })
            .catch(e => {
              this.isRequest = false;
              console.log(e);
            });
        } else if (item.status === 3) {
          parseResult(item.resultHash).then(result => {
            this.upadte(item.id, {
              status: 4,
              result: result
            });
          });
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
  created() {
    if (this.$robonomics.account) {
      this.watchToken(
        this.tokenAddress,
        this.$robonomics.account.address,
        this.$robonomics.factory.address
      );
    }
  },
  computed: {
    myAllowance: function() {
      if (this.$robonomics.account && this.response) {
        return this.allowance(
          this.tokenAddress,
          this.$robonomics.account.address,
          this.$robonomics.factory.address
        );
      }
      return 0;
    }
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
      const id = Date.now();
      const item = {
        id,
        create_time: new Date().toLocaleString(),
        update_time: new Date().toLocaleString(),
        status: 1
      };
      this.storage.addItem(item.id, item);
      this.upLog();
      if (this.currentPage > 0 && this.currentPage < this.log.length - 1) {
        this.currentPage += 1;
      }
      return id;
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
          token: this.tokenAddress,
          cost: this.cost,
          lighthouse: this.$robonomics.lighthouse.address,
          validator: "0x0000000000000000000000000000000000000000",
          validatorFee: 0,
          deadline: r.number + 1000
        };
        let id = null;
        this.$robonomics
          .sendDemand(demand, true, () => {
            this.isRequest = false;
            id = this.add();
          })
          .then(liability => {
            console.log(liability.address);
            if (id) {
              this.upadte(id, {
                status: 2,
                liability: liability.address
              });
            }
            return liability.onResult();
          })
          .then(result => {
            console.log(result);
            if (id) {
              this.upadte(id, {
                status: 3,
                resultHash: result
              });
            }
            parseResult(result).then(result => {
              if (id) {
                this.upadte(id, {
                  status: 4,
                  result: result
                });
              }
            });
          })
          .catch(e => {
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
