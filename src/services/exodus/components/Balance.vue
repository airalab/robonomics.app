<template>
  <span>{{ balance }}</span>
</template>

<script>
import { Robonomics } from "../../../utils/robonomics-substrate";
import { formatBalance } from "../utils/utils";
import config from "../config";

export default {
  props: ["account"],
  data() {
    return {
      balance: null,
      listener: null
    };
  },
  async created() {
    this.robonomics = Robonomics.getInstance(config.CHAIN);
    this.listen();
  },
  destroyed() {
    if (this.listener) {
      this.listener();
    }
  },
  watch: {
    account: function () {
      if (this.listener) {
        this.listener();
        this.listen();
      }
    }
  },
  methods: {
    async listen() {
      this.listener = await this.robonomics.account.getBalance(
        this.account,
        (e) => {
          this.balance = formatBalance(
            e.free.toString(),
            this.robonomics.api.registry.chainDecimals[0],
            this.robonomics.api.registry.chainTokens[0]
          );
          this.$emit("balance", {
            account: this.account,
            balance: e.free.toString(),
            chainDecimals: this.robonomics.api.registry.chainDecimals[0],
            chainTokens: this.robonomics.api.registry.chainTokens[0],
            format: this.balance
          });
        }
      );
    }
  }
};
</script>
