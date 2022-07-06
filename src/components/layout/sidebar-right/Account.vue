<template>
  <robo-card outlined>
    <robo-card-label>
      <robo-card-label-section>
        <robo-icon icon="user" />
      </robo-card-label-section>
      <robo-card-label-section>Your accounts</robo-card-label-section>
    </robo-card-label>

    <template v-if="isReady">
      <robo-card-section>
        <robo-section>
          <robo-text size="tiny"> Balance: </robo-text>
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
          <robo-text size="tiny"> Polkadot ecosystem: </robo-text>
          <robo-text size="small" weight="bold" gap>
            <robo-account-polkadot
              short
              extensionAllowShift
              extensionShowIcon
              selectable
            />
          </robo-text>
          <!-- <template v-if="$store.state.robonomicsUIvue.polkadot.address">
            <robo-text size="tiny">Display address format for: </robo-text>
            <robo-text size="small" weight="bold">
              <robo-account-polkadot-chain />
            </robo-text>
          </template> -->
        </robo-section>
      </robo-card-section>
    </template>
  </robo-card>
</template>

<script>
import { AccountManagerUi as AccountManager } from "robonomics-interface";
import robonomics from "../../../robonomics";
import { fromUnit } from "../../../utils/tools";

export default {
  data() {
    return {
      isReady: false,
      account: null,
      accounts: [],
      unsubscribeBalance: null,
      balance: "0",
      unit: "XRT",
      error: ""
    };
  },
  created() {
    this.connect();
    robonomics.accountManager.onReady(() => {
      this.isReady = true;
    });
  },
  computed: {
    balanceFormat() {
      return Number(
        fromUnit(this.balance, robonomics.api.registry.chainDecimals[0])
      );
    }
  },
  watch: {
    "$store.state.robonomicsUIvue.polkadot.address": function () {
      this.account = this.$store.state.robonomicsUIvue.polkadot.address;
    },
    async account(address) {
      if (this.unsubscribeBalance) {
        this.unsubscribeBalance();
      }
      await robonomics.accountManager.selectAccountByAddress(address);
      this.unsubscribeBalance = await robonomics.account.getBalance(
        address,
        (r) => {
          this.balance = r.free.sub(r.feeFrozen);
        }
      );
    }
  },
  methods: {
    async connect() {
      this.error = "";
      this.unit = robonomics.api.registry.chainTokens[0];
      try {
        await AccountManager.initPlugin(robonomics.accountManager.keyring, {
          isDevelopment: false
        });
        this.account = this.$store.state.robonomicsUIvue.polkadot.address;
      } catch (error) {
        this.error = error.message;
      }
    }
  }
};
</script>
