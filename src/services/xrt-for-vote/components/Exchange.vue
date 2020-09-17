<template>
  <fragment>
    <div class="row" style="margin-top: 30px;">
      <div class="col-md-6" style="text-align: center; font-size: 20px;">
        Balance XRT
      </div>
      <div class="col-md-6" style="text-align: center; font-size: 20px;">
        Balance DAO vote
      </div>
    </div>
    <div class="row">
      <div
        class="col-md-6"
        style="text-align: center; font-size: 20px; font-weight: bold;"
      >
        {{ balanceXrtFormat }}
      </div>
      <div
        class="col-md-6"
        style="text-align: center; font-size: 20px; font-weight: bold;"
      >
        {{ balanceVoteFormat }}
      </div>
    </div>

    <Activate />
  </fragment>
</template>

<script>
import token from "@/mixins/token";
import config from "../config";
import Activate from "./Activate";

export default {
  mixins: [token],
  components: {
    Activate
  },
  data() {
    return {
      burn: "0",
      totalBurn: "0",
      list: {}
    };
  },
  created() {
    this.watchToken(config.XRT, this.$robonomics.account.address);
    this.watchToken(config.VOTE, this.$robonomics.account.address);
  },
  computed: {
    balanceXrt: function () {
      return this.balance(config.XRT, this.$robonomics.account.address);
    },
    balanceXrtFormat: function () {
      return this.balanceFormat(config.XRT, this.$robonomics.account.address);
    },
    balanceVote: function () {
      return this.balance(config.VOTE, this.$robonomics.account.address);
    },
    balanceVoteFormat: function () {
      return this.balanceFormat(config.VOTE, this.$robonomics.account.address);
    }
  }
};
</script>
