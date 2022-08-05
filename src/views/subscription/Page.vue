<template>
  <robo-grid-item>
    <Info
      v-if="subscription.isActive.value"
      :date="subscription.validUntilFormat"
    />
    <InfoNew v-else />

    <!-- <robo-grid columnsRepeat="2">
        <robo-card>
          <robo-card-title size="2"
            >For holders of parachain XRT</robo-card-title
          >
          <robo-section
            >Bond your XRT in Robonomics parachain and earn approx. 10% annual
            revenue.</robo-section
          >
          <robo-button href="#" icon-left="chart-pie" outlined
            >Stake XRT</robo-button
          >
        </robo-card>
        <robo-card>
          <robo-card-title size="2"
            >ERC-20 XRT to parachain XRT</robo-card-title
          >
          <robo-section
            >Take your XRT from Ethereum to Robonomics Parachain.</robo-section
          >
          <robo-button href="#" icon-left="right-left" outlined
            >Request</robo-button
          >
        </robo-card>
      </robo-grid>-->
  </robo-grid-item>
</template>

<script>
import { onUnmounted } from "vue";
import { useAccount } from "@/hooks/useAccount";
import { useSubscription } from "@/hooks/useSubscription";
import InfoNew from "./InfoNew.vue";
import Info from "./Info.vue";
import robonomics from "../../robonomics";

export default {
  components: {
    InfoNew,
    Info
  },
  setup() {
    const { account, unsubscribe } = useAccount();

    onUnmounted(() => {
      unsubscribe();
      if (unsubscribeBlock) {
        unsubscribeBlock();
      }
    });

    const subscription = useSubscription(account);

    let unsubscribeBlock;
    const updateBlock = async () => {
      unsubscribeBlock = await robonomics.onBlock(async () => {
        subscription.loadLedger(account.value);
      });
    };
    updateBlock();

    return {
      account,
      subscription
    };
  }
};
</script>
