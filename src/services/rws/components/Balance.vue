<template>
  <span :title="full" v-clipboard:copy="full">
    {{ label }}
    {{ fixed }}
    {{ symbol }}
  </span>
</template>

<script>
import { utils } from "web3";

export default {
  props: ["amount", "decimals", "symbol"],
  data() {
    return {
      fixed: "",
      full: "",
      label: ""
    };
  },
  created() {
    this.parce();
  },
  watch: {
    amount: function () {
      this.parce();
    }
  },
  methods: {
    parce() {
      const amount = new utils.BN(this.amount);
      this.full = utils.fromWei(amount);
      const rest = this.full.split(".");
      if (!rest[1] || rest[1].length <= 4) {
        this.fixed = this.full;
        this.label = "";
      } else {
        const fixed = new utils.BN("100000000000000");
        if (amount.lt(fixed)) {
          this.fixed = utils.fromWei(fixed);
          this.label = ">";
        } else {
          this.fixed = +Number(this.full).toFixed(4);
          this.label = "~";
        }
      }
    }
  }
};
</script>
