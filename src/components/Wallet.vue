<template>
  <div class="panel-top section-light">
    <div class="panel-top--cell">
      <LinkExplorer :text="account" />
    </div>
    <div v-if="networkId === 1" class="panel-top--cell js-tooltip">
      <b>{{tokens.air.balance | fromWei(tokens.air.decimals)}}</b>
      <span class="t-sm">{{tokens.air.label}}</span>
    </div>
    <div
      v-else
      class="panel-top--cell disabled js-tooltip"
      data-tooltip="Not available for Sidechain"
    >
      <b>0</b>
      <span class="t-sm">AIRA</span>
    </div>
    <div v-if="networkId === 1" class="panel-top--cell js-tooltip">
      <b>{{tokens.airkyc.balance | fromWei(tokens.airkyc.decimals)}}</b>
      <span class="t-sm">{{tokens.airkyc.label}}</span>
    </div>
    <div
      v-else
      class="panel-top--cell disabled js-tooltip"
      data-tooltip="Not available for Sidechain"
    >
      <b>0</b>
      <span class="t-sm">AIRA ID</span>
    </div>
    <div class="panel-top--cell">
      <b>{{tokens.xrt.balance | fromWei(tokens.xrt.decimals)}}</b>
      <span class="t-sm">{{tokens.xrt.label}}</span>
    </div>
    <div class="panel-top--cell">
      <div class="label label-violet">{{nameChain}}</div>
    </div>
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
