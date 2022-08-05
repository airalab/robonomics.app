<template>
  <robo-card
    backColor="lightblue"
    backImage="images/card-back-sample.png"
    backPosition="100% 100%"
    backSize="contain"
  >
    <robo-card-label>
      <robo-card-label-section>Your subscription</robo-card-label-section>
      <robo-card-label-section info>
        {{ $apptextSubscriptionInfo }}
      </robo-card-label-section>
    </robo-card-label>
    <robo-card-section maxWidth="80%">
      <robo-card-title>Use Decentralized IoT</robo-card-title>
      <robo-list fullLine>
        <robo-list-item>
          <small>Price from</small>
          <h3>{{ price }} XRT</h3>
        </robo-list-item>
        <robo-list-item>
          <small>Activation time ~</small>
          <h3>2 min</h3>
        </robo-list-item>
        <robo-list-item>
          <small>Available</small>
          <h3>{{ freeAuctions }} subscriptions</h3>
        </robo-list-item>
      </robo-list>
      <robo-button
        :disabled="!canBid"
        :router="{ name: 'subscription-bid' }"
        icon-left="rss"
      >
        Activate subscription
      </robo-button>
    </robo-card-section>
  </robo-card>
</template>

<script>
import { fromUnit } from "../../utils/tools";
import { bnToBn } from "@polkadot/util";
import robonomics from "../../robonomics";

export default {
  data() {
    return {
      price: 0,
      freeAuctions: 0,
      unsubscribeBlock: null
    };
  },
  computed: {
    canBid() {
      return this.freeAuctions > 0;
    }
  },
  async created() {
    const minimalBid = await robonomics.rws.getMinimalBid();
    this.price = fromUnit(
      minimalBid.add(bnToBn(1)),
      robonomics.api.registry.chainDecimals
    );

    const freeAuctions = await robonomics.rws.getFreeAuctions();
    this.freeAuctions = freeAuctions.length;
    this.unsubscribeBlock = await robonomics.onBlock(async () => {
      const freeAuctions = await robonomics.rws.getFreeAuctions();
      this.freeAuctions = freeAuctions.length;
    });
  },
  unmounted() {
    if (this.unsubscribeBlock) {
      this.unsubscribeBlock();
    }
  }
};
</script>
