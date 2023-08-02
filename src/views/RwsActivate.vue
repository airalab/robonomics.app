<template>
  <robo-layout-section>
    <robo-template-rws-activate
      :price="price"
      activationtime="2"
      :available="freeAuctions"
      @on-activate="onActivate"
      :rwsStatus="status"
      :rwsMessage="message"
    />
  </robo-layout-section>
</template>

<script>
import { useAccount } from "@/hooks/useAccount";
import { useBalance } from "@/hooks/useBalance";
import { useDevices } from "@/hooks/useDevices";
import { useRobonomics } from "@/hooks/useRobonomics";
import { useSend } from "@/hooks/useSend";
import { useSubscription } from "@/hooks/useSubscription";
import { fromUnit } from "@/utils/tools";
import { bnToBn } from "@polkadot/util";
import { computed, onUnmounted, ref, watch, watchEffect } from "vue";

export default {
  setup() {
    const price = ref(0);
    const freeAuctions = ref(0);
    const status = ref("new");
    const message = ref("");
    let unsubscribeBlock = null;

    const robonomics = useRobonomics();
    const { account, unsubscribe: unsubscribeAccount } = useAccount();
    const { balance, unsubscribe: unsubscribeBalance } = useBalance(account);
    const subscription = useSubscription(account);
    const devices = useDevices(account);

    watch(
      [subscription.hasSubscription, subscription.isActive, account],
      () => {
        if (subscription.hasSubscription.value) {
          if (subscription.isActive.value) {
            status.value = "ok";
            message.value = "You already have subsription";
          } else {
            status.value = "renew";
            message.value = "";
          }
        } else {
          status.value = "new";
          message.value = "";
        }
      }
    );

    (async () => {
      freeAuctions.value = (await robonomics.rws.getFreeAuctions()).length;
      unsubscribeBlock = await robonomics.events.onBlock(async () => {
        freeAuctions.value = (await robonomics.rws.getFreeAuctions()).length;
      });

      const minimalBid = await robonomics.rws.getMinimalBid();
      price.value = minimalBid.add(bnToBn(1));
    })();

    onUnmounted(() => {
      if (unsubscribeBlock) {
        unsubscribeBlock();
      }
      if (unsubscribeBalance) {
        unsubscribeBalance();
      }
      unsubscribeAccount();
    });

    const tx = useSend();
    const onActivate = async () => {
      const oldStatus = status.value;
      status.value = "processing";
      message.value = "";
      if (
        !balance.value ||
        bnToBn(balance.value).add(bnToBn(1000000000)).lt(price.value)
      ) {
        status.value = "error";
        message.value =
          "Subscription can not be activated due to unsuffcicient XRT balance";
        return;
      }
      if (freeAuctions.value <= 0) {
        status.value = "error";
        message.value = "There are no available subscriptions";
        return;
      }
      if (subscription.hasSubscription.value && subscription.isActive.value) {
        status.value = "error";
        message.value = "You have an active subscription";
        return;
      }

      let call = robonomics.rws.bid(
        Number(await robonomics.rws.getFirtsFreeAuction()),
        price.value
      );
      if (!devices.devices.value.includes(account.value)) {
        call = robonomics.api.tx.utility.batch([
          call,
          robonomics.rws.setDevices([...devices.devices.value, account.value])
        ]);
      }
      await tx.send(call);
      if (tx.error.value) {
        if (tx.error.value !== "Cancelled") {
          status.value = "error";
          message.value = tx.error.value;
        } else {
          status.value = oldStatus;
        }
        return;
      }

      const unsubscribeBlock = await robonomics.events.onBlock(() => {
        subscription.loadLedger();
      });
      const stopWatchEffect = watchEffect(() => {
        if (subscription.hasSubscription.value && subscription.isActive.value) {
          stopWatchEffect();
          unsubscribeBlock();
          status.value = "ok";
        }
      });
    };

    const priceFormat = computed(() => {
      return fromUnit(price.value, robonomics.api.registry.chainDecimals[0]);
    });

    return {
      freeAuctions,
      price: priceFormat,
      status,
      message,
      onActivate
    };
  }
};
</script>
