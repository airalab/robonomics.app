<template>
  <robo-layout-section>
    <robo-template-rws-buy
      :price="price"
      activationtime="2"
      :available="freeAuctions"
      :chainInfoUploaded="chainInfoStatus"
      :rwsExpiration="expiredate"
      @on-activate="onActivate"
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
    const chainInfoStatus = ref(false);
    let unsubscribeBlock = null;

    const { isReady, getInstance } = useRobonomics();
    const { account, unsubscribe: unsubscribeAccount } = useAccount();
    const { balance, unsubscribe: unsubscribeBalance } = useBalance(account);
    const subscription = useSubscription(account);
    const devices = useDevices(account);

    watch(
      isReady,
      async (isReady) => {
        if (isReady) {
          const robonomics = getInstance();
          freeAuctions.value = (await robonomics.rws.getAuctionQueue()).length;
          unsubscribeBlock = await robonomics.events.onBlock(async () => {
            freeAuctions.value = (
              await robonomics.rws.getAuctionQueue()
            ).length;
          });

          const minimalBid = await robonomics.rws.getMinimalBid();
          price.value = minimalBid.add(bnToBn(1));
          chainInfoStatus.value = true;
        }
      },
      { immediate: true }
    );

    onUnmounted(() => {
      if (unsubscribeBlock) {
        unsubscribeBlock();
      }
      if (unsubscribeBalance) {
        unsubscribeBalance();
      }
      unsubscribeAccount();
    });

    const transaction = useSend();
    const onActivate = async (setStatus) => {

      /* это для тестов eslint-disable no-unreachable */
      // setStatus("ok");
      // return;

      if (!isReady.value) {
        setStatus("error", "Parachain is not ready");
        return;
      }

      if (
        !balance.value ||
        bnToBn(balance.value).lt(price.value.add(bnToBn(10000000)))
      ) {
        console.log(balance.value);
        setStatus(
          "error",
          "Subscription can not be activated due to unsuffcicient XRT balance"
        );
        return;
      }

      if (freeAuctions.value <= 0) {
        setStatus("error", "There are no available subscriptions");
        return;
      }

      if (subscription.hasSubscription.value && subscription.isActive.value) {
        setStatus("error", "You have an active subscription");
        return;
      }

      const robonomics = getInstance();
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
      const tx = transaction.createTx();
      await transaction.send(tx, call);
      if (tx.error.value) {
        if (tx.error.value !== "Cancelled") {
          setStatus("error", tx.error.value);
        } else {
          setStatus("cancel");
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
          setStatus("ok");
        }
      });
    };

    const priceFormat = computed(() => {
      if (isReady.value) {
        return fromUnit(
          price.value,
          getInstance().api.registry.chainDecimals[0],
          0
        );
      }
      return 0;
    });

    return {
      freeAuctions,
      price: priceFormat,
      expiredate: subscription.validUntil,
      chainInfoStatus,
      onActivate
    };
  }
};
</script>