<template>
  <fragment>
    <div v-if="hasSubscribed">
      <b>Subscription for account {{ $account }} is issued.</b>
    </div>
    <section v-if="currentPrice > 0" :class="{ disabled: hasSubscribed }">
      <select v-model="type" class="container-full">
        <option value="1">XRT</option>
        <option value="2">DAI</option>
        <option value="3">ETH</option>
      </select>
      <hr />
      <XRT
        v-if="type == 1"
        :currentPrice="currentPrice"
        @subscribed="checkSubscribed"
      />
      <DAI
        v-if="type == 2"
        :currentPrice="currentPrice"
        @subscribed="checkSubscribed"
      />
      <ETH
        v-if="type == 3"
        :currentPrice="currentPrice"
        @subscribed="checkSubscribed"
      />
    </section>
  </fragment>
</template>

<script>
import XRT from "./XRT";
import DAI from "./DAI";
import ETH from "./ETH";
import config from "../config";
import SubscribeABI from "../abi/Subscribe.json";

export default {
  components: { XRT, DAI, ETH },
  created() {
    this.getCurrentPrice();
    this.checkSubscribed();
  },
  data() {
    return {
      type: 1,
      currentPrice: 0,
      hasSubscribed: false
    };
  },
  methods: {
    getCurrentPrice() {
      const contract = new this.$robonomics.web3.eth.Contract(
        SubscribeABI,
        config.SUBSCRIBE
      );
      return contract.methods
        .currentPrice()
        .call()
        .then((r) => {
          this.currentPrice = Math.ceil(
            Number(r) + (Number(r) * config.OVER_PERCENT) / 100
          ).toString();
        });
    },
    checkSubscribed() {
      const contract = new this.$robonomics.web3.eth.Contract(
        SubscribeABI,
        config.SUBSCRIBE
      );
      contract
        .getPastEvents("Subscribed", {
          filter: { buyer: this.$robonomics.account.address },
          fromBlock: 0,
          toBlock: "latest"
        })
        .then((events) => {
          if (events.length > 0) {
            this.hasSubscribed = true;
          } else {
            this.hasSubscribed = false;
          }
        });
    }
  }
};
</script>
