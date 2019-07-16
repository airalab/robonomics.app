<template>
  <div class="panel-top section-light">
    <div class="panel-top--cell">
      <IconLink :href="`https://etherscan.io/address/${account}`" :text="account" />
    </div>
    <div class="panel-top--cell js-tooltip" data-tooltip="Not available for Sidechain">
      <b>{{air.balance | fromWei(air.decimals)}}</b>
      <span class="t-sm">{{air.label}}</span>
    </div>
    <div class="panel-top--cell js-tooltip" data-tooltip="Not available for Sidechain">
      <b>{{airkyc.balance | fromWei(airkyc.decimals)}}</b>
      <span class="t-sm">{{airkyc.label}}</span>
    </div>
    <div class="panel-top--cell">
      <b>{{xrt.balance | fromWei(xrt.decimals)}}</b>
      <span class="t-sm">{{xrt.label}}</span>
    </div>
    <!-- <div class="panel-top--cell">
      <div class="label label-violet">Sidechain</div>
    </div> -->
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      account: ""
    };
  },
  computed: {
    ...mapState("token", ["air", "airkyc", "xrt"])
  },
  mounted() {
    this.account = web3.eth.accounts[0];
  }
};
</script>
