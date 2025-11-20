<template>
  <div>
    <div><b>Ipfs file info</b>: {{ file }}</div>
    <div v-if="info">replica: {{ info.reported_replica_count }}</div>
    <div v-if="balance && price">
      <div><b>Balance</b>: {{ $filters.balance(balance, 12, "CRU") }}</div>
      <div><b>Price</b>: {{ $filters.balance(price, 12, "CRU") }}</div>

      <div v-if="info === null">
        <div v-if="canStored">
          <robo-button @click="storeFile">store file</robo-button>
        </div>
        <div v-else>low balance</div>
      </div>
    </div>
    <div v-else>...</div>
  </div>
</template>

<script>
import { Crust } from "@/utils/crust";
import { useAccount } from "robonomics-interface-vue/account";
import { computed, ref } from "vue";

export default {
  name: "CrustStore",
  props: ["file"],
  emits: ["store"],
  setup(props, { emit }) {
    const { account, pair } = useAccount();
    const crust = new Crust("wss://rpc.crust.network");

    const balance = ref();
    const price = ref();
    const info = ref();

    crust.watch(async () => {
      balance.value = await crust.getBalance(account.value);
      price.value = await crust.getStorePrice(props.file.size);
      info.value = (await crust.getInfo(props.file.path)).toHuman();
      if (info.value) {
        emit("store");
      }
    });

    const canStored = computed(() => {
      if (balance.value > price.value) {
        return true;
      }
      return false;
    });

    const storeFile = async () => {
      if (canStored.value === false) {
        return;
      }
      const tx = crust.storeFile(props.file.path, props.file.size);
      const res = await crust.signAndSend(pair.value, tx);
      console.log(res);
      emit("store");
    };

    return {
      balance,
      price,
      info,
      canStored,
      storeFile
    };
  }
};
</script>
