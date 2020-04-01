<template>
  <div>
    <div v-if="ready">
      <section v-if="$robonomics.account">
        <div class="input-size--md">
          <RButton v-if="isRequest" fullWidth color="green">
            {{
            $t("sensors.requested")
            }}
          </RButton>
          <RButton v-else @click.native="sendMsgDemand" fullWidth>
            {{
            $t("sensors.isRequest")
            }}
          </RButton>
        </div>
      </section>
      <RCard v-if="log.length > 0">
        <table class="container-full table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ $t("sensors.table.model") }}</th>
              <th>{{ $t("sensors.table.sender") }}</th>
              <th>{{ $t("sensors.table.token") }}</th>
              <th>{{ $t("sensors.table.view") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, key) in log" :key="key">
              <td>{{ key + 1 }}</td>
              <td>
                <b>{{ getTypeByModel(item.model) }}</b>&nbsp;
                <RIpfsExplorer :hash="item.model" />
              </td>
              <td>
                <RChainExplorer :address="item.sender" />
              </td>
              <td>
                <template v-if="item.cost > 0">
                  <RChainExplorer :address="item.token" category="token" />/
                  <b>{{ item.cost }}</b>
                </template>
                <template v-else>
                  <b>{{ $t("sensors.table.free") }}</b>
                </template>
              </td>
              <td>
                <router-link
                  v-if="item.cost > 0"
                  :to="{
                    name: 'sensor-cost',
                    params: {
                      lighthouse: lighthouse,
                      model: item.model,
                      agent: item.sender,
                      token: item.token,
                      cost: item.cost
                    }
                  }"
                >{{ $t("sensors.table.view") }}</router-link>
                <router-link
                  v-else
                  :to="{
                    name: 'sensor',
                    params: {
                      lighthouse: lighthouse,
                      model: item.model,
                      agent: item.sender
                    }
                  }"
                >{{ $t("sensors.table.view") }}</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </RCard>
    </div>
  </div>
</template>

<script>
import config from "~config";

export default {
  props: ["lighthouse"],
  data() {
    return {
      ready: false,
      isRequest: false,
      log: []
    };
  },
  mounted() {
    if (this.$robonomics.messenger) {
      this.$robonomics.messenger.stop();
    }
    this.$robonomics.initLighthouse(this.lighthouse).then(() => {
      this.ready = true;
      this.$robonomics.onDemand(config.DEFAULT_MODEL, msg => {
        console.log("demand", msg);
      });
      this.$robonomics.onOffer(null, msg => {
        console.log("offer", msg);
        if (hasOwnProperty.call(config.CATEGORY_MODELS, msg.model)) {
          this.log.push(msg.toObject());
        }
      });
    });
  },
  methods: {
    getTypeByModel(model) {
      return config.CATEGORY_MODELS[model];
    },
    sendMsgDemand() {
      this.isRequest = true;
      this.$robonomics.web3.eth.getBlock("latest", (e, r) => {
        const demand = {
          model: config.DEFAULT_MODEL,
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
