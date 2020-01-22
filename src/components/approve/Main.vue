<template>
  <fragment>
    <section>
      <Info
        style="margin-bottom:10px"
        :cost="initAmountWei"
        :balance="balance"
        :allowance="allowance"
        :decimals="decimals"
        :symbol="symbol"
      />
    </section>
    <template v-if="alwaysShow || Number(initAmountWei) > Number(allowance)">
      <form v-on:submit.prevent="submit">
        <Input
          ref="form"
          :onSubmit="onSubmit"
          :onChange="onChange"
          :initAmountWei="initAmountWei"
          :maxAmount="balance"
          :decimals="decimals"
        />
      </form>
      <button
        class="container-full btn-big"
        :disabled="loadingApprove || Number(amount) == Number(allowance)"
        @click="submit"
      >
        <div class="loader-ring" v-if="loadingApprove"></div>
        &nbsp;{{ $t("approve.approve") }}
      </button>
    </template>
  </fragment>
</template>

<script>
import Input from "./Input";
import Info from "./Info";
import token from "./token";
import { number } from "../../RComponents/tools/utils";

export default {
  mixins: [token],
  props: {
    initAmountWei: {
      type: String,
      default: "0"
    },
    alwaysShow: {
      type: Boolean,
      default: true
    }
  },
  // props: ["initAmountWei", "address", "onInitToken", "onFetch"],
  components: {
    Input,
    Info
  },
  data() {
    return {
      amount: this.initAmountWei,
      loadingApprove: false
    };
  },
  methods: {
    submit() {
      this.$refs.form.submit();
    },
    onChange(fields) {
      this.amount = number.toWei(fields.amount.value, this.decimals);
    },
    onSubmit(e, fields) {
      this.loadingApprove = true;
      if (e) {
        this.loadingApprove = false;
      } else {
        this.approve(fields.amount.value)
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
