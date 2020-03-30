<template>
  <form v-on:submit.prevent="submit">
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
          label: this.$t("lighthouse.withdraw.from"),
          value: "1",
          type: "text",
          rules: [
            "require",
            "number",
            robonomicsVC.validators.min(1),
            v => robonomicsVC.validators.max(this.maxCount)(v)
          ],
          error: false
        }
      },
      minimalStake: 0,
      maxCount: 0,
      run: false
    };
  },
  computed: {
    ...mapGetters("tokens", ["balance", "token"]),
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
    isDisabledBtn: function() {
      if (this.run || this.error) {
        return true;
      }
      return false;
    },
    textBtn: function() {
      if (this.run) {
        return "...";
      }
      return this.$t("lighthouse.withdraw.from");
    }
  },
  watch: {
    myBalance: function() {
      this.setMaxCount();
    }
  },
  created() {
    this.$robonomics.lighthouse.methods
      .minimalStake()
      .call()
      .then(r => {
        this.minimalStake = Number(r);
        this.setMaxCount();
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
      this.sendWithdraw()
        .then(() => {
          this.run = false;
          this.setMaxCount();
        })
        .catch(() => {
          this.run = false;
        });
    },
    setMaxCount() {
      this.$robonomics.lighthouse.methods
        .stakes(this.$robonomics.account.address)
        .call()
        .then(stake => {
          if (stake > 0) {
            this.maxCount = Number(stake) / this.minimalStake;
          } else {
            this.maxCount = 0;
          }
          this.fields.count.value = this.maxCount;
        });
    },
    sendWithdraw() {
      return this.$robonomics.lighthouse.methods
        .withdraw(this.minimalStake * Number(this.fields.count.value))
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
