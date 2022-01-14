<template>
  <div :class="{ disabled: process }">
    <button v-if="!isOpenForm" class="btn-outline" @click="openForm">
      Bond more
    </button>

    <template v-else>
      <form v-on:submit.prevent="submit">
        <p class="input-measured input-size--s">
          <input
            v-model="fields.value.value"
            type="text"
            placeholder
            class="container-full"
            :class="{ error: fields.value.error }"
          /><span class="input-measure">XRT</span>
        </p>
        &nbsp;
        <button v-if="process" class="btn-outline" disabled>
          <div class="loader-ring"></div>
          Bonding
        </button>
        <template v-else>
          <button v-if="canBond" class="btn-outline">Bond</button>
          <button v-else class="btn-outline" disabled>Bond</button>
        </template>
        <p>
          <b>Note:</b> all rewards credited to your account before adding more
          funds to stake, will be automatically paid out. New rewards will be
          calculated according to new bonding balance.
        </p>
      </form>
    </template>
  </div>
</template>

<script>
import { Robonomics } from "../../../utils/robonomics-substrate";
import { toUnit, toDecimal } from "../utils/utils";
import robonomicsVC from "robonomics-vc";
import config from "../config";

export default {
  props: ["stash"],
  mixins: [robonomicsVC.mixins.form],
  data() {
    return {
      fields: {
        value: {
          value: "0",
          type: "text",
          rules: ["require", (v) => Number(v) > 0],
          error: false
        }
      },
      robonomics: null,
      accounts: [],
      process: false,
      isOpenForm: false,
      balance: "",
      listener: null
    };
  },
  async created() {
    this.robonomics = Robonomics.getInstance(config.CHAIN);

    this.$on("onChange", this.onChange);
    this.$on("onSubmit", this.bond);
    this.onChange();
    this.listenBalance();
  },
  computed: {
    maxBond() {
      return (
        this.balance >=
        Number(
          toDecimal(
            toUnit(
              this.fields.value.value,
              this.robonomics.api.registry.chainDecimals
            )
          ).add(
            toDecimal(
              toUnit(config.REST, this.robonomics.api.registry.chainDecimals)
            )
          )
        )
      );
    },
    canBond() {
      return !this.error && this.balance > 0 && this.maxBond;
    }
  },
  methods: {
    openForm() {
      this.isOpenForm = !this.isOpenForm;
    },
    onChange() {
      this.validate();
    },
    async bond() {
      if (!this.error) {
        this.process = true;
        try {
          await this.robonomics.accountManager.selectAccountByAddress(
            this.stash
          );
          const tx = this.robonomics.staking.bondExtra(
            toUnit(
              this.fields.value.value,
              this.robonomics.api.registry.chainDecimals
            )
          );
          const result = await this.robonomics.accountManager.signAndSend(tx);
          this.fields.value.value = 0;
          this.$emit("result", result);
        } catch (error) {
          console.log(error);
          this.$emit("error", error.message);
        }
        this.process = false;
      }
    },
    async listenBalance() {
      this.listener = await this.robonomics.account.getBalance(
        this.stash,
        (r) => {
          this.balance = Number(r.free.sub(r.miscFrozen).toString());
        }
      );
    }
  },
  watch: {
    stash: function () {
      if (this.listener) {
        this.listener();
        this.listenBalance();
      }
    }
  },
  destroyed() {
    if (this.listener) {
      this.listener();
    }
  }
};
</script>

<style scoped>
.mt15 {
  margin-top: 15px;
}
</style>
