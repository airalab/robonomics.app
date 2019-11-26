<template>
  <div>
    <div v-if="ready">
      <h4>
        {{ $t("sensors.statusAgent") }}:
        <template v-if="log.length === 0">
          {{ $t("sensors.notStatusAgent") }}
        </template>
        <template v-else>
          {{ $t("sensors.yesStatusAgent") }} {{ log[log.length - 1].time }}
        </template>
      </h4>
      <section>
        <div class="input-size--md">
          <RButton v-if="isRequest" full green>{{
            $t("sensors.requested")
          }}</RButton>
          <RButton v-else @click.native="sendMsgDemand" full>{{
            $t("sensors.isRequest")
          }}</RButton>
        </div>
      </section>
      <section
        v-if="log.length > 0"
        class="section-light window"
        id="window-sensornetwork-requests"
      >
        <div class="window-head">
          <span>{{ $t("sensors.requests") }}</span>
          <a class="window-head-toggle" href="#">–</a>
        </div>
        <div class="window-content">
          <section
            class="section-light"
            v-for="(item, key) in log.slice().reverse()"
            :key="key"
          >
            <Message
              :item="item"
              :lighthouse="lighthouse"
              :model="model"
              :agent="agent"
            />
          </section>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import axios from "axios";
import { cat as ipfsCat } from "../../RComponents/tools/ipfs";
import rosBag from "../../utils/rosBag";
import Message from "./Message";
import history from "./historyStore";
import config from "../../config";

const OBJECTIVE = "QmVAFgUxBitKqtV2sjaYcHkKfcAPVy3GswhaE5n5bcgLkf";
function loadScript(src) {
  return new Promise(function(resolve, reject) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default {
  props: ["lighthouse", "model", "agent", "result"],
  components: {
    Message
  },
  data() {
    return {
      ready: false,
      isRequest: false,
      log: [],
      storeKey: `sn_${this.lighthouse}_${this.model}_${this.agent}`
    };
  },
  mounted() {
    loadScript("https://platform.twitter.com/widgets.js");

    this.$robonomics.initLighthouse(this.lighthouse).then(() => {
      this.ready = true;

      Vue.nextTick(function() {
        window.windowSlide();
      });

      if (this.result) {
        this.log.push({
          status: 2,
          resultHash: this.result
        });
        const index = this.log.length - 1;
        this.parseResult(this.result).then(result => {
          Vue.set(this.log, index, {
            ...this.log[index],
            status: 3,
            result: result
          });
        });
      } else {
        const data = history.getData(this.storeKey);
        this.log = data;
        data.forEach((item, index) => {
          this.parseResult(item.resultHash).then(result => {
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
      }

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

          this.parseResult(msg.result).then(result => {
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
    parseResult(result) {
      let message = {};
      axios.get(`${config.IPFS_GATEWAY}${result}`).then(() => {
        console.log("result ipfs hash resolved");
      });
      return ipfsCat(result).then(r => {
        return rosBag(
          new Blob([r]),
          bag => {
            try {
              message = JSON.parse(bag.message.data);
            } catch (error) {
              console.log(error);
            }
          },
          { topics: ["/data"] }
        ).then(() => {
          return message;
        });
      });
    },
    sendMsgDemand() {
      this.isRequest = true;
      this.$robonomics.web3.eth.getBlock("latest", (e, r) => {
        const demand = {
          model: this.model,
          objective: OBJECTIVE,
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
            // history.addItem(this.storeKey, item);
          })
          .catch(e => {
            this.isRequest = false;
            console.log(e);
          });
      });
    }
  }
};
</script>
