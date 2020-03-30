<template>
  <div class="t-align--center">
    <div>{{ $t("passport.priceTitle") }}:</div>
    <b class="t-gt">{{ cost | fromWei(decimals, symbol) }}</b>
    <p>
      <a href="javascript:;" @click="details = !details">
        <template v-if="details">{{ $t("passport.detailsLess") }}</template>
        <template v-else>{{ $t("passport.details") }}</template>
      </a>
    </p>
    <div v-show="details" style="max-width: 600px; margin: 10px auto;">
      <div class="row">
        <div class="col-sm-6">
          <div class="m-b-5">
            <span>{{ $t("passport.agent") }}:</span>&nbsp;
            <RChainExplorer :address="sender" />
          </div>
          <div class="m-b-5">
            <span>{{ $t("passport.token") }}:</span>&nbsp;
            <RChainExplorer :address="address" category="token" />
          </div>
          <div class="m-b-5">
            <span>{{ $t("passport.objective") }}:</span>&nbsp;
            <RIpfsExplorer :hash="objective" />
          </div>
        </div>
        <div class="col-sm-6">
          <div class="m-b-5">{{ $t("approve.balance") }}: {{ balanceFormat(address, from) }}</div>
          <div
            class="m-b-5"
            :class="{ red: Number(cost) > Number(allowance(address, from, to)) }"
          >{{ $t("approve.allowance") }}: {{ allowanceFormat(address, from, to) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import token from "@/mixins/token";

export default {
  props: [
    "sender",
    "objective",
    "address",
    "from",
    "to",
    "cost",
    "initDetails"
  ],
  mixins: [token],
  created() {
    this.watchToken(this.address, this.from, this.to);
  },
  watch: {
    address: function(newAddressl) {
      this.watchToken(newAddressl, this.from, this.to);
    }
  },
  computed: {
    decimals: function() {
      return this.token(this.address).decimals;
    },
    symbol: function() {
      return this.token(this.address).symbol;
    }
  },
  data() {
    return {
      details: this.initDetails
    };
  }
};
</script>
