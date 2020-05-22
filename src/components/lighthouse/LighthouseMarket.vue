<template>
  <fragment>
    <RCard>
      <TradeForm ref="form" @onChange="onChange" @onSubmit="onSubmit" />

      <section class="m-b-0">
        <div v-if="error" style="margin: 5px 0;">
          {{ $t("lighthouse.market.error") }}
        </div>
        <Approve
          v-if="Number(cost) > 0 && tokenAddress"
          :address="tokenAddress"
          :from="$robonomics.account.address"
          :to="$robonomics.factory.address"
          :initAmountWei="costWei"
          :alwaysShow="false"
          :onInitToken="onInitToken"
        />
        <RButton
          v-if="Number(myAllowance) >= Number(costWei)"
          @click="sendMsgDemand"
          :disabled="run"
          color="green"
        >
          <div class="loader-ring" v-if="run"></div>
          &nbsp;{{ $t("lighthouse.market.broadcast") }}
        </RButton>
      </section>
    </RCard>

    <RCard class="window" id="window-lighthouse-messages">
      <div class="window-head">
        <span>{{ $t("lighthouse.market.messages") }}</span>
        <a class="window-head-toggle" href="#">–</a>
      </div>
      <div class="window-content">
        <div
          v-for="(item, i) in log"
          :key="`${i}-${item.date}`"
          style="margin: 5px 0;"
        >
          <template v-if="item.type == 'liability'">
            <RAvatar
              :address="item.address"
              class="avatar-small align-vertical m-r-10"
            />
            <b>[{{ item.date.toLocaleString() }}]</b>
            New {{ item.type }}&nbsp;
            <a :href="item.address | urlChainExplorer" target="_blank">{{
              item.address | labelAddress
            }}</a>
          </template>
          <template v-else-if="item.type == 'result'">
            <RAvatar
              :address="item.address"
              class="avatar-small align-vertical m-r-10"
            />
            <b>[{{ item.date.toLocaleString() }}]</b>
            New {{ item.type }}&nbsp;
            <a :href="item.hash | urlIpfsExplorer" target="_blank">{{
              item.hash | labelAddress
            }}</a>
          </template>
          <template v-else>
            <RAvatar
              :address="item.sender"
              class="avatar-small align-vertical m-r-10"
            />
            <b>[{{ item.date.toLocaleString() }}]</b>
            New {{ item.type }} from
            <span v-if="item.type == 'demand'">dapp account</span>
            <span v-else>Aira</span>&nbsp;
            <a :href="item.sender | urlChainExplorer" target="_blank">{{
              item.sender | labelAddress
            }}</a>
          </template>
          <hr />
        </div>
      </div>
    </RCard>
  </fragment>
</template>

<script>
import Approve from "@/components/approve/Main";
import token from "@/mixins/token";
import order, { STATUS } from "@/mixins/order";
import { number } from "@/utils/tools";
import TradeForm from "./TradeForm";

export default {
  mixins: [token, order],
  components: {
    TradeForm,
    Approve
  },
  data() {
    return {
      account: "",
      messages: {},
      tokenAddress: null,
      cost: 0,
      error: false,
      idOrder: null,
      run: false
    };
  },
  computed: {
    log: function () {
      return Object.values(this.messages)
        .sort(function (a, b) {
          if (a.date > b.date) {
            return -1;
          }
          if (a.date < b.date) {
            return 1;
          }
          return 0;
        })
        .slice(0, 10);
    },
    costWei() {
      return number.toWei(this.cost, this.decimals);
    },
    decimals: function () {
      return this.token(this.tokenAddress).decimals;
    },
    myAllowance: function () {
      return this.$robonomics.account
        ? this.allowance(
            this.tokenAddress,
            this.$robonomics.account.address,
            this.$robonomics.factory.address
          )
        : 0;
    }
  },
  created() {
    this.$on("update", this.handleOrder);
  },
  mounted() {
    this.tooltip();
    this.init();
  },
  methods: {
    handleOrder(order) {
      if (
        this.idOrder === order.id &&
        (order.status === STATUS.EMPTY || order.status >= STATUS.CONTRACT)
      ) {
        this.run = false;
      }
      if (order.liability) {
        if (!this.messages[order.liability]) {
          this.$set(this.messages, order.liability, {
            date: new Date(),
            type: "liability",
            address: order.liability
          });
        }
        if (
          order.result &&
          !this.messages[order.liability + "/" + order.result]
        ) {
          this.$set(this.messages, order.liability + "/" + order.result, {
            date: new Date(),
            type: "result",
            hash: order.result,
            address: order.liability
          });
        }
      }
    },
    init() {
      this.account = this.$robonomics.account.address;
      this.$refs.form.fields.token.value = this.$robonomics.xrt.address;
      this.$robonomics.onDemand(null, (msg) => {
        const hash = msg.getHash();
        if (!this.messages[hash]) {
          this.$set(this.messages, hash, {
            date: new Date(),
            type: "demand",
            sender: msg.sender
          });
        }
      });
      this.$robonomics.onOffer(null, (msg) => {
        const hash = msg.getHash();
        if (!this.messages[hash]) {
          this.$set(this.messages, hash, {
            date: new Date(),
            type: "offer",
            sender: msg.sender
          });
        }
      });
    },
    sendMsgDemand() {
      this.$refs.form.submit();
    },
    onChange({ fields }) {
      this.tokenAddress = fields.token.value;
      this.cost = fields.cost.value;
      if (this.tokenAddress) {
        this.watchToken(
          this.tokenAddress,
          this.$robonomics.account.address,
          this.$robonomics.factory.address
        );
      }
    },
    onSubmit({ error, fields }) {
      this.error = error;
      if (!error) {
        this.run = true;
        this.$robonomics.web3.eth.getBlock("latest", (e, r) => {
          const demand = {
            model: fields.model.value,
            objective: fields.objective.value,
            token: fields.token.value,
            cost: number.toWei(fields.cost.value, this.decimals),
            lighthouse: this.$robonomics.lighthouse.address,
            validator: "0x0000000000000000000000000000000000000000",
            validatorFee: 0,
            deadline: r.number + 1000
          };
          this.idOrder = this.runOrder({ demand });
        });
      }
    },
    tooltip() {
      const reference = document.querySelectorAll(".js-tooltip");
      if (reference) {
        reference.forEach(function (elem) {
          new Tooltip(elem, {
            title: elem.getAttribute("data-tooltip"),
            placement: elem.getAttribute("data-placement") || "auto",
            container: "body"
          });
        });
      }
    }
  }
};
</script>
