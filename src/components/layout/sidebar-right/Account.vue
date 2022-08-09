<template>
  <robo-card outlined>
    <robo-card-label>
      <robo-card-label-section>
        <robo-icon icon="user" />
      </robo-card-label-section>
      <robo-card-label-section>Your accounts</robo-card-label-section>
    </robo-card-label>

    <robo-card-section>
      <robo-section>
        <robo-text size="tiny">Balance:</robo-text>
        <robo-balance
          :balance="[
            {
              account: 'polkadot',
              quantity: balanceFormat
            }
          ]"
          :currency="unit"
        />
      </robo-section>
    </robo-card-section>

    <robo-card-section>
      <robo-section>
        <robo-text size="tiny">Polkadot ecosystem:</robo-text>
        <robo-text size="small" weight="bold" gap>
          <robo-account-polkadot
            short
            extensionAllowShift
            extensionShowIcon
            selectable
            @after-injected="handlerAddress"
            @on-address-change="handlerAddress"
          />
        </robo-text>
        <template v-if="$store.state.robonomicsUIvue.polkadot.address">
          <robo-text size="tiny">Chain format:</robo-text>
          <robo-text size="small" weight="bold">
            <robo-account-polkadot-chain />
          </robo-text>
        </template>
      </robo-section>
    </robo-card-section>
  </robo-card>
</template>

<script>
import robonomics from "../../../robonomics";
import { fromUnit } from "../../../utils/tools";

export default {
  data() {
    return {
      unsubscribeBalance: null,
      balance: "0",
      unit: "XRT"
    };
  },
  created() {
    this.unit = robonomics.api.registry.chainTokens[0];
  },
  computed: {
    balanceFormat() {
      return Number(
        fromUnit(this.balance, robonomics.api.registry.chainDecimals[0])
      );
    }
  },
  methods: {
    async handlerAddress() {
      if (this.unsubscribeBalance) {
        this.unsubscribeBalance();
      }
      const account = this.$store.state.robonomicsUIvue.polkadot.accounts.find(
        (item) =>
          item.address === this.$store.state.robonomicsUIvue.polkadot.address
      );
      await robonomics.accountManager.setAccount(
        account,
        this.$store.state.robonomicsUIvue.polkadot.extensionObj
      );
      this.unsubscribeBalance = await robonomics.account.getBalance(
        account.address,
        (r) => {
          this.balance = r.free.sub(r.feeFrozen);
        }
      );
    }
  }
};
</script>
