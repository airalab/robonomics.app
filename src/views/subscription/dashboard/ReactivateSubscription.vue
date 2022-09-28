<template>
  <div>
    <robo-card-title>
      <robo-status type="warning" textRight="Expired" />
    </robo-card-title>

    <robo-section>
      <robo-list>
        <robo-list-item>
          <robo-text weight="bold">Expired on: {{ date }}</robo-text>
        </robo-list-item>
        <robo-list-item>
          <robo-text weight="bold">
            Owner:
            <robo-account-polkadot short inline />
          </robo-text>
        </robo-list-item>
      </robo-list>
    </robo-section>

    <robo-button
      :disabled="!canBid"
      :router="{ name: 'subscription-bid' }"
      icon-left="rss"
      type="alarm"
    >
      Re-activate subscription
    </robo-button>
  </div>
</template>

<script>
import { fromUnit } from "../../../utils/tools";
import { bnToBn } from "@polkadot/util";
import robonomics from "../../../robonomics";

export default {
  props: ["date"],
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
