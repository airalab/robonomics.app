<template>
  <div :class="{ disabled: process }">
    <button v-if="!isOpenForm" class="btn-outline" @click="openForm">
      Unbond
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
        <button class="btn-outline" v-if="!process" :disabled="error">
          Unbond
        </button>
        <button class="btn-outline" v-else disabled>
          <span class="loader-ring"></span> Unbonding
        </button>
      </form>
    </template>
  </div>
</template>

<script>
import { Robonomics } from "../../../utils/robonomics-substrate";
import { toUnit } from "../utils/utils";
import robonomicsVC from "robonomics-vc";
import config from "../config";

export default {
  props: ["controller"],
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
      isOpenForm: false
    };
  },
  async created() {
    this.robonomics = Robonomics.getInstance(config.CHAIN);

    this.$on("onChange", this.onChange);
    this.$on("onSubmit", this.unbond);
    this.onChange();
  },
  methods: {
    openForm() {
      this.isOpenForm = !this.isOpenForm;
    },
    onChange() {
      this.validate();
    },
    async unbond() {
      if (!this.error) {
        this.process = true;
        try {
          await this.robonomics.accountManager.selectAccountByAddress(
            this.controller
          );
          const tx = this.robonomics.staking.unbond(
            toUnit(
              this.fields.value.value,
              this.robonomics.api.registry.chainDecimals
            )
          );
          const result = await this.robonomics.accountManager.signAndSend(tx);
          this.fields.value.value = 0;
          this.$emit("result", result);
        } catch (error) {
          this.$emit("error", error.message);
        }
        this.process = false;
      }
    }
  }
};
</script>

<style scoped>
.mt15 {
  margin-top: 15px;
}
</style>
