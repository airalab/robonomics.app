<template>
  <robo-grid-item>
    <robo-card>
      <robo-card-label>
        <robo-card-label-section>New subscription</robo-card-label-section>
        <robo-card-label-section info>
          {{ $apptextSubscriptionInfo }}
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
                By activating the subscription, the address of any of your
                devices will have the right to send priority transactions within
                the Robonomics parachain, which guarantees the ability to send
                transactions stably every block.
              </robo-text>
              <robo-text size="small" gap>
                During the entire period of an active subscription, the device
                has guaranteed block inclusion to send one transaction per block
                for free.
              </robo-text>
            </robo-section>
          </robo-list-item>
          <robo-list-item v-if="tx.process.value">
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
          <template v-if="tx.process.value">Submitting</template>
          <template v-else-if="isLedger">Submitted</template>
          <template v-else>Submit</template>
        </robo-button>
      </robo-card-section>
    </robo-card>
  </robo-grid-item>
</template>

<script>
import { onUnmounted, watch, ref } from "vue";
import { useRouter } from "vue-router";
import { useAccount } from "@/hooks/useAccount";
import { useSubscription } from "@/hooks/useSubscription";
import { useSend } from "@/hooks/useSend";
import { toUnit, fromUnit } from "../../utils/tools";
import { bnToBn } from "@polkadot/util";
import robonomics from "../../robonomics";

export default {
  setup() {
    const balance = ref(0);
    const unsubscribeBalance = ref(null);
    const { account, unsubscribe } = useAccount();

    onUnmounted(() => {
      unsubscribe();
      unsubscribeBalance.value();
    });

    watch(
      account,
      async () => {
        if (unsubscribeBalance.value) {
          unsubscribeBalance.value();
        }
        unsubscribeBalance.value = await robonomics.account.getBalance(
          account.value,
          (r) => {
            balance.value = r.free.sub(r.feeFrozen);
          }
        );
      },
      { immediate: true }
    );

    const subscription = useSubscription(account);
    const router = useRouter();

    watch(
      subscription.subscription,
      (newValue, oldValue) => {
        if (oldValue === undefined) {
          return;
        }
        if (newValue !== null && subscription.isActive.value) {
          tx.process.value = false;
          router.push({ name: "subscription-devices" });
        }
      },
      { immediate: true }
    );

    const price = ref(0);
    (async () => {
      const minimalBid = await robonomics.rws.getMinimalBid();
      price.value = fromUnit(
        minimalBid.add(bnToBn(1)),
        robonomics.api.registry.chainDecimals
      );
    })();

    const tx = useSend();
    const bid = async () => {
      const call = await robonomics.rws.bid(
        Number(await robonomics.rws.getFirtsFreeAuction()),
        Number(toUnit(price.value, robonomics.api.registry.chainDecimals))
      );
      await tx.send(call);
      tx.process.value = true;
    };

    return {
      account,
      subscription,
      balance,
      price,
      tx,
      bid
    };
  },

  data() {
    return {
      plan: "1 month",
      freeAuctions: 0,
      isLedger: false,
      unsubscribeBlock: null
    };
  },
  computed: {
    canBid() {
      return this.freeAuctions > 0;
    },
    isDisabled() {
      return this.tx.process.value || this.balance <= 0 || !this.canBid;
    }
  },
  async created() {
    const freeAuctions = await robonomics.rws.getFreeAuctions();
    this.freeAuctions = freeAuctions.length;
    this.unsubscribeBlock = await robonomics.onBlock(async () => {
      const freeAuctions = await robonomics.rws.getFreeAuctions();
      this.freeAuctions = freeAuctions.length;
      this.subscription.loadLedger(this.account);
    });
  },
  unmounted() {
    if (this.unsubscribeBlock) {
      this.unsubscribeBlock();
    }
  }
};
</script>
