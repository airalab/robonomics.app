<template>
  <div class="sidebar-col-in">
    <section>
      <LinkExplorer :text="account" classStyle="nowrap" />
      <div class="m-t-10 label label-violet">{{nameChain}}</div>
    </section>
    <section>
      <div
        v-if="networkId === 1"
        class="disabled js-tooltip"
        data-tooltip="Not available for Sidechain"
      >
        <b class="m-r-10">{{tokens.air.balance | fromWei(tokens.air.decimals)}}</b>
        <span class="t-sm">{{tokens.air.label}}</span>
      </div>
      <hr v-if="networkId === 1" />
      <div
        v-if="networkId === 1"
        class="disabled js-tooltip"
        data-tooltip="Not available for Sidechain"
      >
        <b class="m-r-10">{{tokens.airkyc.balance | fromWei(tokens.airkyc.decimals)}}</b>
        <span class="t-sm">{{tokens.airkyc.label}}</span>
      </div>
      <hr v-if="networkId === 1" />
      <div>
        <b class="m-r-10">{{tokens.xrt.balance | fromWei(tokens.xrt.decimals)}}</b>
        <span class="t-sm">{{tokens.xrt.label}}</span>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Web3Check from "vue-web3-check";

export default {
  data() {
    return {
      account: "",
      networkId: 0
    };
  },
  computed: {
    ...mapState("token", ["tokens"]),
    nameChain: function() {
      return this.networkId === 1 ? "Mainnet" : "Sidechain";
    }
  },
  mounted() {
    this.account = this.$robonomics.account.address;
    this.networkId = Web3Check.store.state.networkId;

    var reference = document.querySelectorAll(".js-tooltip");
    if (reference) {
      reference.forEach(function(e) {
        new window.Tooltip(e, {
          title: e.getAttribute("data-tooltip"),
          placement: "auto",
          container: "body"
        });
      });
    }
  }
};
</script>
