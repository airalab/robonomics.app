<template>
  <div>
    <robo-grid flex mediaMobile="transfer" offset="x1">
      <div>
        <robo-text size="small" weight="light">
          Price<br />
          from
        </robo-text>
        <robo-text weight="bold" nowrap>{{ price }} XRT</robo-text>
      </div>
      <div>
        <robo-text size="small" weight="light">Activation time ~</robo-text>
        <robo-text weight="bold" nowrap>2 min</robo-text>
      </div>
      <div>
        <robo-text size="small" weight="light">
          Available subscriptions
        </robo-text>
        <robo-text weight="bold" nowrap>{{ freeAuctions }}</robo-text>
      </div>
    </robo-grid>

    <robo-button
      :disabled="!canBid"
      :router="{ name: 'subscription-bid' }"
      icon-left="rss"
      type="alarm"
    >
      Activate subscription
    </robo-button>
  </div>
</template>

<script>
import { fromUnit } from "../../../utils/tools";
import { bnToBn } from "@polkadot/util";
import robonomics from "../../../robonomics";

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
