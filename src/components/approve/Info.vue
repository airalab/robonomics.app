<template>
  <div class="row">
    <div class="col-sm-12">
      <div class="m-b-5">
        <span>{{ $t("approve.balance") }}:</span>
        &nbsp;
        {{ balanceFormat(address, from) }}
      </div>
      <div class="m-b-5">
        <span>{{ $t("approve.allowance") }}:</span>
        &nbsp;
        {{ allowanceFormat(address, from, to) }}
      </div>
    </div>
  </div>
</template>

<script>
import token from "@/mixins/token";

export default {
  mixins: [token],
  props: ["address", "from", "to"],
  created() {
    this.watchToken(this.address, this.from, this.to);
  },
  watch: {
    address: function(newAddressl) {
      this.watchToken(newAddressl, this.from, this.to);
    }
  }
};
</script>
