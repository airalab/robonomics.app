<template>
  <div>
    <div v-if="received">free minimum received</div>
    <div v-else>
      <div v-if="address">
        {{ address }}
        <button
          @click="requestFreeMinimum"
          :disabled="!avaible || (status !== 1 && status !== 4)"
        >
          Get free minimum
        </button>
        <div v-if="status === 3">request sent</div>
        {{ error }}
      </div>
      <div v-else>Not found parachain account</div>
    </div>
  </div>
</template>

<script>
import { $web3 } from "@/plugins/web3";
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { checkAvailible, getFreeMinimum } from "./apiNftOracle";

export default {
  props: ["token"],
  setup(props) {
    const account = ref();

    const store = useStore();

    watch(
      () => store.state.robonomicsUIvue.polkadot.address,
      (address) => {
        try {
          account.value = store.state.robonomicsUIvue.polkadot.accounts.find(
            (item) => item.address === address
          );
        } catch (e) { console.error(e); }
      },
      { immediate: true }
    );

    const address = computed(() => account.value?.address);

    const error = ref();

    const avaible = ref(false);
    const check = async () => {
      const r = await checkAvailible(props.token, $web3.state.account);
      avaible.value = r[0];
      error.value = r[1];
    };
    check();
    const timerId = setInterval(check, 10000);

    const received = computed(() => {
      if (
        !avaible.value &&
        error.value === "Free minimum for this token has already been received"
      ) {
        return true;
      }
      return false;
    });
    watch(
      received,
      (received) => {
        if (received) {
          status.value = 1;
          clearInterval(timerId);
        }
      },
      { immediate: true }
    );

    const status = ref(1);
    const requestFreeMinimum = async () => {
      status.value = 2;
      const r = await getFreeMinimum(
        props.token,
        $web3.state.account,
        address.value
      );
      if (r[0]) {
        status.value = 3;
      } else {
        status.value = 4;
      }
      error.value = r[1];
    };

    return {
      address,
      received,
      avaible,
      error,
      status,
      requestFreeMinimum
    };
  }
};
</script>
