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
import { fromUnit } from "@/utils/tools";
import { bnToBn } from "@polkadot/util";
import { usePolkadotApi } from "robonomics-interface-vue";
import {
  useAccount,
  useBalance,
  useSend
} from "robonomics-interface-vue/account";
import {
  useAction as useActionDevices,
  useDevices
} from "robonomics-interface-vue/devices";
import {
  useAction,
  useAvailableSubscriptions,
  useSubscription
} from "robonomics-interface-vue/subscription";
import { useAction as useActionTools } from "robonomics-interface-vue/tools";
import { computed, ref, watch, watchEffect } from "vue";

export default {
  setup() {
    const price = ref(0);
    const chainInfoStatus = ref(false);

    const { isConnected, instance } = usePolkadotApi();
    const { account } = useAccount();
    const { balance } = useBalance(account);
    const { data: dataSubscription } = useSubscription(account);
    const { data: dataDevices } = useDevices(account);
    const { data: freeAuctions } = useAvailableSubscriptions();
    const { tx } = useSend();
    const { batch } = useActionTools();
    const actionDevices = useActionDevices();
    const action = useAction();
    // watch(isConnected, () => isConnected && load());

    watch(
      isConnected,
      async (isConnected) => {
        if (isConnected) {
          const minimalBid = instance.api.consts.rws.minimalBid;
          price.value = minimalBid.add(bnToBn(1));
          chainInfoStatus.value = true;
        }
      },
      { immediate: true }
    );

    const onActivate = async (setStatus) => {
      /* это для тестов eslint-disable no-unreachable */
      // setStatus("ok");
      // return;

      if (!isConnected.value) {
        setStatus("error", "Parachain is not ready");
        return;
      }

      if (
        !balance.value ||
        bnToBn(balance.value).lt(price.value.add(bnToBn(10000000)))
      ) {
        console.log(balance.value.toString());
        setStatus(
          "error",
          "Subscription can not be activated due to unsuffcicient XRT balance"
        );
        return;
      }

      if (freeAuctions.value <= 0) {
        console.log(freeAuctions.value);
        setStatus("error", "There are no available subscriptions");
        return;
      }

      if (
        dataSubscription.value.hasSubscription &&
        dataSubscription.value.isActive
      ) {
        setStatus("error", "You have an active subscription");
        return;
      }

      const calls = [await action.bid(1000000001)];
      if (!dataDevices.value.includes(account.value)) {
        calls.push(actionDevices.add(dataDevices.value, account.value));
      }

      await tx.send(() => batch(calls));
      if (tx.error.value) {
        if (tx.error.value !== "Cancelled") {
          setStatus("error", tx.error.value);
        } else {
          setStatus("cancel");
        }
        return;
      }

      const stopWatchEffect = watchEffect(() => {
        if (
          dataSubscription.value.hasSubscription &&
          dataSubscription.value.isActive
        ) {
          stopWatchEffect();
          setStatus("ok");
        }
      });
    };

    const priceFormat = computed(() => {
      if (isConnected.value) {
        return fromUnit(price.value, 9, 0);
      }
      return 0;
    });

    const expiredate = computed(() => {
      return dataSubscription.value ? dataSubscription.value.validUntil : null;
    });

    return {
      freeAuctions,
      price: priceFormat,
      expiredate,
      chainInfoStatus,
      onActivate
    };
  }
};
</script>
