<template>
  <form v-on:submit.prevent="sendApprove">
    <!-- <section>
      <div class="form-item form-line-label">
        <label for="inputdata-amount">
          Amount *
          <span
            v-if="form.fields.amount.error"
            class="input-msg"
          >Check if data correct, please.</span>
        </label>
        <input
          v-model="form.fields.amount.value"
          class="container-full"
          :class="{ error: form.fields.amount.error }"
          type="text"
          required
        />
      </div>
    </section>-->
    <button
      v-if="!err"
      :disabled="loadingApprove || Number(balance) < Number(form.fields.amount.value)"
      @click="sendApprove"
    >
      <div class="loader-ring" v-if="loadingApprove"></div>
      &nbsp;{{ $t("approve.approve") }}
    </button>
  </form>
</template>

<script>
import { Token } from "robonomics-js";
import { number } from "../../RComponents/tools/utils";

export default {
  props: ["address", "cost", "onInitToken", "onFetch"],
  data() {
    return {
      form: {
        fields: {
          amount: {
            value: "0",
            rules: ["require", "min", "max"],
            error: false
          }
        },
        error: false
      },
      err: false,
      token: null,
      symbol: "",
      decimals: 0,
      balance: 0,
      allowance: 0,
      loadingApprove: false
    };
  },
  mounted() {
    this.err = false;
    if (!this.$robonomics.web3.utils.isAddress(this.address)) {
      this.err = true;
      return;
    }
    this.initToken(this.address).then(this.fetchData);
  },
  watch: {
    cost: function(newVal) {
      this.form.fields.amount.value = number.fromWei(newVal, this.decimals);
    },
    address: function(newVal) {
      this.err = false;
      if (!this.$robonomics.web3.utils.isAddress(newVal)) {
        this.err = true;
        return;
      }
      this.initToken(newVal).then(this.fetchData);
    }
  },
  methods: {
    validate() {
      this.form.error = false;
      for (let field in this.form.fields) {
        this.form.fields[field].error = false;
        this.form.fields[field].rules.forEach(rule => {
          if (rule === "require" && !this.form.fields[field].value) {
            this.form.fields[field].error = true;
            this.form.error = true;
          } else if (
            rule === "min" &&
            Number(number.toWei(this.form.fields[field].value, this.decimals)) <
              1
          ) {
            this.form.fields[field].error = true;
            this.form.error = true;
          } else if (
            rule === "max" &&
            Number(number.toWei(this.form.fields[field].value, this.decimals)) >
              Number(this.balance)
          ) {
            this.form.fields[field].error = true;
            this.form.error = true;
          }
        });
      }
      return !this.form.error;
    },
    async initToken(address) {
      this.token = new Token(this.$robonomics.web3, address);
      this.decimals = await this.token.methods.decimals().call();
      this.symbol = await this.token.methods.symbol().call();
      this.form.fields.amount.value = number.fromWei(this.cost, this.decimals);
      if (this.onInitToken) {
        this.onInitToken({
          decimals: this.decimals,
          symbol: this.symbol
        });
      }
    },
    async fetchData() {
      this.balance = await this.token.methods
        .balanceOf(this.$robonomics.account.address)
        .call();
      this.allowance = await this.token.methods
        .allowance(
          this.$robonomics.account.address,
          this.$robonomics.factory.address
        )
        .call();
      if (this.onFetch) {
        this.onFetch({
          balance: this.balance,
          allowance: this.allowance
        });
      }
    },
    sendApprove() {
      if (this.validate()) {
        this.loadingApprove = true;
        return this.token.methods
          .approve(
            this.$robonomics.factory.address,
            number.toWei(this.form.fields.amount.value, this.decimals)
          )
          .send({
            from: this.$robonomics.account.address
          })
          .then(() => {
            this.loadingApprove = false;
            return this.fetchData();
          })
          .catch(() => {
            this.loadingApprove = false;
          });
      }
    }
  }
};
</script>
