<template>
  <fragment>
    <RCard>
      <TradeForm ref="form" :onChange="onChange" :onSubmit="onSubmit" />

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
          @click.native="sendMsgDemand"
          :disabled="watch"
          green
        >
          <div class="loader-ring" v-if="watch"></div>
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
          style="margin: 5px 0"
        >
          <template v-if="item.type == 'liability'">
            <RAvatar
              :address="item.address"
              class="avatar-small align-vertical m-r-10"
            />
            <b>[{{ item.date.toLocaleString() }}]</b>
            New {{ item.type }}&nbsp;
            <a :href="item.address | urlExplorer" target="_blank">
              {{ item.address | labelAddress }}
            </a>
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
            <a :href="item.sender | urlExplorer" target="_blank">
              {{ item.sender | labelAddress }}
            </a>
          </template>
          <hr />
        </div>
      </div>
    </RCard>
  </fragment>
</template>

<script>
import Vue from "vue";
import TradeForm from "./TradeForm";
import Approve from "@/components/approve/Main";
import token from "@/mixins/token";
import { number } from "../../RComponents/tools/utils";

export default {
  mixins: [token],
  components: {
    TradeForm,
    Approve
  },
  data() {
    return {
      account: "",
      messages: {},
      nonce: null,
      id: null,
      tokenAddress: null,
      cost: 0,
      error: false
    };
  },
  computed: {
    log: function() {
      return Object.values(this.messages)
        .sort(function(a, b) {
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
    demand() {
      return this.$store.getters["sender/demandById"](this.id);
    },
    watch() {
      return this.demand && this.demand.status > 0 && this.demand.status < 6
        ? true
        : false;
    },
    decimals: function() {
      return this.token(this.tokenAddress).decimals;
    },
    myAllowance: function() {
      return this.allowance(
        this.tokenAddress,
        this.$robonomics.account.address,
        this.$robonomics.factory.address
      );
    }
  },
  watch: {
    demand: function(newStatus) {
      if (newStatus.status === 6) {
        this.setNonce();
      }
    }
  },
  mounted() {
    this.account = this.$robonomics.account.address;
    this.$refs.form.fields.token.value = this.$robonomics.xrt.address;
    this.$robonomics.onDemand(null, msg => {
      const hash = msg.getHash();
      if (!this.messages[hash]) {
        Vue.set(this.messages, hash, {
          date: new Date(),
          type: "demand",
          sender: msg.sender
        });
      }
    });
    this.$robonomics.onOffer(null, msg => {
      const hash = msg.getHash();
      if (!this.messages[hash]) {
        Vue.set(this.messages, hash, {
          date: new Date(),
          type: "offer",
          sender: msg.sender
        });
      }
    });
    this.$robonomics.onLiability((err, liability) => {
      if (
        this.demand &&
        this.id &&
        liability.address &&
        this.demand.sender === this.$robonomics.account.address
      ) {
        this.$store.dispatch("sender/setContract", {
          id: this.id,
          address: liability.address
        });
      }
      if (!this.messages[liability.address]) {
        Vue.set(this.messages, liability.address, {
          date: new Date(),
          type: "liability",
          address: liability.address
        });
      }
    });
    this.tooltip();

    return this.setNonce();
  },
  methods: {
    sendMsgDemand() {
      this.$refs.form.submit();
    },
    onChange(fields) {
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
    onSubmit(e, fields) {
      this.error = e;
      if (!e) {
        this.$robonomics.web3.eth.getBlock("latest", (e, r) => {
          const demand = {
            model: fields.model.value,
            objective: fields.objective.value,
            token: fields.token.value,
            cost: number.toWei(fields.cost.value, this.decimals),
            lighthouse: this.$robonomics.lighthouse.address,
            validator: "0x0000000000000000000000000000000000000000",
            validatorFee: 0,
            deadline: r.number + 1000,
            nonce: this.nonce
          };
          this.$store.dispatch("sender/sendDemand", demand).then(id => {
            this.id = id;
          });
        });
      }
    },
    setNonce() {
      this.$robonomics.factory.methods
        .nonceOf(this.$robonomics.account.address)
        .call()
        .then(r => {
          this.nonce = Number(r);
        });
    },
    tooltip() {
      const reference = document.querySelectorAll(".js-tooltip");
      if (reference) {
        reference.forEach(function(elem) {
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
