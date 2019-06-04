<template>
  <p>
    <span class="t-sm">Available for trade:</span>
    <br>
    <input class="input-size--sm m-r-10 input-sm" type="text" value="1">
    <button
      v-on:click="sendApproveTrade"
      :disabled="approveTrade.disabled"
      class="btn-blue input-sm"
    >{{ approveTrade.text }}</button>
  </p>
</template>

<script>
import { Promise } from "bluebird";

export default {
  data() {
    return {
      approveTrade: {
        value: 0,
        disabled: true,
        text: "Approve XRT"
      }
    };
  },
  mounted() {
    return this.fetchData();
  },
  methods: {
    fetchData() {
      return this.$robonomics.xrt.call
        .balanceOf(this.$robonomics.account.address)
        .then(balanceOf => {
          const calls = [];
          if (balanceOf > 0) {
            calls.push(
              this.$robonomics.xrt.call
                .allowance(
                  this.$robonomics.account.address,
                  this.$robonomics.factory.address
                )
                .then(allowance => {
                  this.approveTrade.value = allowance;
                  this.approveTrade.disabled = false;
                  this.approveTrade.text = "Approve XRT";
                  this.$parent.$emit("approve", true);
                })
            );
          }
          return Promise.all(calls);
        });
    },
    sendApproveTrade() {
      this.approveTrade.disabled = true;
      this.approveTrade.text = "...";
      return this.$robonomics.xrt.send
        .approve(this.$robonomics.factory.address, 1000000000, {
          from: this.$robonomics.account.address
        })
        .then(() => {
          this.approveTrade.text = "Approved";
          this.approveTrade.disabled = false;
          return this.$parent.$emit("approve", true);
        })
        .then(() => this.fetchData())
        .catch(() => {
          this.approveTrade.text = "Approve XRT";
          this.approveTrade.disabled = false;
        });
    }
  }
};
</script>
