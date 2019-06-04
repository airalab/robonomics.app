<template>
  <section>
    <div class="panel-top">
      <div class="panel-top--cell">
        <IconLink :href="`https://etherscan.io/address/${account}`" :text="account"/>
      </div>
      <div class="panel-top--cell">
        <b>{{air.balance | fromWei(air.decimals)}}</b>
        <span class="t-sm">{{air.label}}</span>
      </div>
      <div class="panel-top--cell">
        <b>{{airkyc.balance | fromWei(airkyc.decimals)}}</b>
        <span class="t-sm">{{airkyc.label}}</span>
      </div>
      <div class="panel-top--cell">
        <b>{{xrt.balance | fromWei(xrt.decimals)}}</b>
        <span class="t-sm">{{xrt.label}}</span>
      </div>
      <div class="panel-top--cell">
        <LangSwitcher :loader="loader"/>
      </div>
    </div>
  </section>
</template>

<script>
import { mapState } from "vuex";
import LangSwitcher from "./LangSwitcher";

export default {
  props: ["loader"],
  data() {
    return {
      account: ""
    };
  },
  components: {
    LangSwitcher
  },
  computed: {
    ...mapState("token", ["air", "airkyc", "xrt"])
  },
  mounted() {
    this.account = web3.eth.accounts[0];
  }
};
</script>
