<template>
  <robo-grid-item>
    <Info v-if="isLedger" :date="validUntilFormat" />
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
import InfoNew from "./InfoNew.vue";
import Info from "./Info.vue";
import robonomics from "../../robonomics";

export default {
  components: {
    InfoNew,
    Info
  },
  data() {
    return {
      account: null,
      unsubscribeAccount: null,
      unsubscribeBlock: null,
      subscription: null,
      isLedger: false
    };
  },
  computed: {
    validUntil() {
      if (this.subscription === null) {
        return false;
      }
      const issue_time = this.subscription.issueTime.toNumber();
      let days = 0;
      if (this.subscription.kind.isDaily) {
        days = this.subscription.kind.value.days.toNumber();
      }
      return issue_time + days * (24 * 60 * 60 * 1000);
    },
    validUntilFormat() {
      if (this.subscription === null) {
        return "-";
      }
      return new Date(this.validUntil).toLocaleDateString();
    }
  },
  async created() {
    if (robonomics.accountManager.account) {
      this.account = robonomics.accountManager.account.address;
    }
    this.unsubscribeAccount = robonomics.accountManager.onChange((account) => {
      this.account = account.address;
      this.updateLedger();
    });

    this.updateLedger();
    this.unsubscribeBlock = await robonomics.onBlock(async () => {
      this.updateLedger();
    });
  },
  unmounted() {
    if (this.unsubscribeAccount) {
      this.unsubscribeAccount();
    }
    if (this.unsubscribeBlock) {
      this.unsubscribeBlock();
    }
  },
  methods: {
    async updateLedger() {
      const subscription = await robonomics.rws.getLedger(this.account);
      this.isLedger = !subscription.isNone;
      if (this.isLedger) {
        this.subscription = subscription.value;
      }
    }
  }
};
</script>
