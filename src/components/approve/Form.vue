<template>
  <div class="form-item form-line-label">
    <form v-on:submit.prevent="submit">
      <Input
        ref="form"
        :onSubmit="onSubmit"
        :onChange="onChange"
        :initAmountWei="initAmountWei"
        :maxAmountWei="balance(address, from)"
        :decimals="token(address).decimals"
      />
      <button
        class="btn-sm m-l-10"
        :disabled="
          loadingApprove ||
            Number(amount) == Number(allowance(address, from, to))
        "
      >
        <div class="loader-ring" v-if="loadingApprove"></div>
        &nbsp;{{ $t("approve.approve") }}
      </button>
    </form>
  </div>
</template>

<script>
import token from "@/mixins/token";
import Input from "./Input";
import { number } from "../../utils/tools";

export default {
  mixins: [token],
  props: {
    address: {},
    from: {},
    to: {},
    initAmountWei: {
      default: "0"
    }
  },
  components: {
    Input
  },
  data() {
    return {
      amount: this.initAmountWei,
      loadingApprove: false
    };
  },
  created() {
    this.watchToken(this.address, this.from, this.to);
  },
  watch: {
    address: function(newAddressl) {
      this.watchToken(newAddressl, this.from, this.to);
    }
  },
  methods: {
    submit() {
      this.$refs.form.submit();
    },
    onChange(fields) {
      const info = this.token(this.address);
      if (info) {
        this.amount = number.toWei(fields.amount.value, info.decimals);
      }
    },
    onSubmit(e, fields) {
      this.loadingApprove = true;
      if (e) {
        this.loadingApprove = false;
      } else {
        const info = this.token(this.address);
        if (info) {
          const value = number.toWei(fields.amount.value, info.decimals);
          this.approve(this.address, value, this.from, this.to)
            .then(() => {
              this.loadingApprove = false;
            })
            .catch(() => {
              this.loadingApprove = false;
            });
        }
      }
    }
  }
};
</script>
