<template>
  <div>
    {{ $t("approve.cost") }}: {{ cost | fromWei(decimals, symbol) }} |
    {{ $t("approve.balance") }}: {{ balance | fromWei(decimals, symbol) }} |
    {{ $t("approve.allowance") }}: {{ allowance | fromWei(decimals, symbol) }}
  </div>
</template>

<script>
export default {
  props: ["cost", "balance", "allowance", "decimals", "symbol"]
};
</script>
