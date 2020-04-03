<template>
  <form v-on:submit.prevent="submit">
    <p>
      <span class="t-sm">{{ $t("lighthouse.approve.value") }}:</span>
      <br />
      <b>{{ myAllowance | fromWei(9, "XRT") }}</b>
    </p>
    <hr />
    <p>
      <span class="t-sm">{{ fields.count.label }}:</span>
      <br />
      <input
        type="text"
        v-model="fields.count.value"
        class="input-size--sm m-r-10 input-sm"
        :class="{ error: fields.count.error }"
      />
      <button :disabled="isDisabledBtn">{{textBtn}}</button>
    </p>
  </form>
</template>

<script>
import { mapGetters } from "vuex";
import robonomicsVC from "robonomics-vc";

export default {
  mixins: [robonomicsVC.mixins.form],
  data() {
    return {
      fields: {
        count: {
          label: this.$t("lighthouse.approve.count"),
          value: "1",
          type: "text",
          rules: ["require", "number", robonomicsVC.validators.min(1)],
          error: false
        }
      },
      minimalStake: 0,
      run: false
    };
  },
  computed: {
    ...mapGetters("tokens", ["balance", "allowance", "token"]),
    myBalance: function() {
      return this.$robonomics.account
        ? Number(
            this.balance(
              this.$robonomics.xrt.address,
              this.$robonomics.account.address
            )
          )
        : 0;
    },
    myAllowance: function() {
      return this.$robonomics.account
        ? this.allowance(
            this.$robonomics.xrt.address,
            this.$robonomics.account.address,
            this.$robonomics.lighthouse.address
          )
        : 0;
    },
    isDisabledBtn: function() {
      if (
        this.run ||
        this.error ||
        this.myBalance < this.minimalStake * Number(this.fields.count.value)
      ) {
        return true;
      }
      return false;
    },
    textBtn: function() {
      if (this.run) {
        return "...";
      }
      if (
        this.myAllowance >=
        this.minimalStake * Number(this.fields.count.value)
      ) {
        return this.$t("lighthouse.approve.refill");
      }
      return this.$t("lighthouse.approve.quotes");
    }
  },
  created() {
    if (this.$robonomics.account) {
      this.$store.dispatch("tokens/watchAllowance", {
        token: this.$robonomics.xrt.address,
        from: this.$robonomics.account.address,
        to: this.$robonomics.lighthouse.address
      });
    }
    this.$robonomics.lighthouse.methods
      .minimalStake()
      .call()
      .then(r => {
        this.minimalStake = Number(r);
      });
    this.$on("onChange", this.onChange);
    this.$on("onSubmit", this.onSubmit);
  },
  methods: {
    onChange() {
      this.validate();
    },
    onSubmit() {
      this.run = true;
      if (
        this.myAllowance >=
        this.minimalStake * Number(this.fields.count.value)
      ) {
        this.sendRefill()
          .then(() => {
            this.run = false;
            this.fields.count.value = 1;
          })
          .catch(() => {
            this.run = false;
          });
      } else {
        this.sendApprove()
          .then(() => {
            this.run = false;
            this.fields.count.value = 1;
          })
          .catch(() => {
            this.run = false;
          });
      }
    },
    sendApprove() {
      return this.$robonomics.xrt.methods
        .approve(
          this.$robonomics.lighthouse.address,
          this.minimalStake * Number(this.fields.count.value)
        )
        .send({
          from: this.$robonomics.account.address
        });
    },
    sendRefill() {
      return this.$robonomics.lighthouse.methods
        .refill(this.minimalStake * Number(this.fields.count.value))
        .send({
          from: this.$robonomics.account.address
        })
        .then(() => {
          this.$store.dispatch("providers/fetchData");
        });
    }
  }
};
</script>
