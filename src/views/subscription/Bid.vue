<template>
  <robo-grid-item>
    <robo-card>
      <robo-card-label>
        <robo-card-label-section>New subscription</robo-card-label-section>
        <robo-card-label-section info>
          {{$apptextSubscriptionInfo}}
        </robo-card-label-section>
      </robo-card-label>
      <robo-card-section>
        <robo-list>
          <robo-list-item>
            <robo-text size="small">Choose plan:</robo-text>
            <robo-text size="medium" highlight="link">
              <robo-select :options="['1 month']" v-model="plan" clean />
            </robo-text>
          </robo-list-item>
          <robo-list-item>
            <robo-text size="small">Check owner account:</robo-text>
            <robo-text weight="light" size="tiny">
              [Polkadot ecosystem]
            </robo-text>
            <robo-text gap size="medium" highlight="link">
              <robo-account-polkadot short />
            </robo-text>
          </robo-list-item>
          <robo-list-item>
            <robo-section>
              <robo-text size="small" gap>Price and terms:</robo-text>
              <robo-grid columnsRepeat="3" align="fit-content" embed>
                <robo-grid-item>
                  <robo-text weight="light" size="small">
                    Price from
                  </robo-text>
                  <robo-text weight="bold" size="medium">
                    {{ price }} XRT
                  </robo-text>
                </robo-grid-item>
                <robo-grid-item>
                  <robo-text weight="light" size="small">
                    Activation time ~
                  </robo-text>
                  <robo-text weight="bold" size="medium">2 min</robo-text>
                </robo-grid-item>
                <robo-grid-item>
                  <robo-text weight="light" size="small">
                    Available subscriptions
                  </robo-text>
                  <robo-text weight="bold" size="medium">
                    {{ freeAuctions }}
                  </robo-text>
                </robo-grid-item>
              </robo-grid>
            </robo-section>

            <robo-section>
              <robo-text size="small" gap>
                By activating the subscription, the address of any of your devices will have the right to send priority transactions within the Robonomics parachain, which guarantees the ability to send transactions stably every block.
              </robo-text>
              <robo-text size="small" gap>
                During the entire period of an active subscription, the device has guaranteed block inclusion to send one transaction per block for free.
              </robo-text>
            </robo-section>
          </robo-list-item>

          <robo-list-item v-if="process">
            <robo-text weight="bold" size="medium">
              Please wait for activation <robo-loader />
            </robo-text>
          </robo-list-item>
        </robo-list>
        <robo-button
          :disabled="isDisabled || isLedger"
          @click="bid"
          block
          size="big"
        >
          <template v-if="process">Submitting</template>
          <template v-else-if="isLedger">Submitted</template>
          <template v-else>Submit</template>
        </robo-button>
      </robo-card-section>
    </robo-card>
  </robo-grid-item>
</template>

<script>
import { toUnit, fromUnit } from "../../utils/tools";
import { bnToBn } from "@polkadot/util";
import robonomics from "../../robonomics";

export default {
  data() {
    return {
      plan: "1 month",
      price: 0,
      freeAuctions: 0,
      account: null,
      balance: 0,
      isLedger: false,
      unsubscribeAccount: null,
      unsubscribeBalance: null,
      unsubscribeBlock: null,
      process: false,
      error: "",
      accounts: []
    };
  },
  computed: {
    canBid() {
      return this.freeAuctions > 0;
    },
    isDisabled() {
      return this.process || this.balance <= 0 || !this.canBid;
    }
  },
  watch: {
    async account() {
      this.error = "";
      this.process = false;
      if (this.unsubscribeBalance) {
        this.unsubscribeBalance();
      }
      this.unsubscribeBalance = await robonomics.account.listenBalance(
        this.account,
        (r) => {
          this.balance = r;
        }
      );
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
      this.updateLedger();
    });
    this.updateLedger();
  },
  unmounted() {
    if (this.unsubscribeAccount) {
      this.unsubscribeAccount();
    }
    if (this.unsubscribeBlock) {
      this.unsubscribeBlock();
    }
    if (this.unsubscribeBalance) {
      this.unsubscribeBalance();
    }
  },
  methods: {
    async bid() {
      this.error = "";
      this.process = true;
      try {
        const tx = await robonomics.rws.bid(
          Number(await robonomics.rws.getFirtsFreeAuction()),
          Number(toUnit(this.price, robonomics.api.registry.chainDecimals))
        );
        const resultTx = await robonomics.accountManager.signAndSend(tx);
        console.log("saved block", resultTx.block, resultTx.tx);
      } catch (e) {
        this.error = e.message;
        this.process = false;
      }
    },
    async updateLedger() {
      const ledger = await robonomics.rws.getLedger(this.account);
      this.isLedger = !ledger.isNone;
      if (this.isLedger) {
        this.process = false;
        this.$router.push({ name: "subscription-devices" });
      }
    }
  }
};
</script>
