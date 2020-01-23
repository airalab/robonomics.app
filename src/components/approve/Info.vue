<template>
  <div class="row">
    <div class="col-sm-12">
      <div class="m-b-5">
        <span>{{ $t("approve.balance") }}:</span>
        &nbsp;
        {{ balance | fromWei(decimals, symbol) }}
      </div>
      <div class="m-b-5">
        <span>{{ $t("approve.allowance") }}:</span>
        &nbsp;
        {{ allowance | fromWei(decimals, symbol) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["cost", "balance", "allowance", "decimals", "symbol"]
};
</script>
