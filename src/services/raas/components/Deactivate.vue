<template>
  <section>
    <h3>Swap RWS tokens to Robonomics tps</h3>
    <RButton
      size="big"
      fullWidth
      @click="run"
      :disabled="
        (proccess > 0 && proccess < 3) ||
        (stake.status == 2 &&
          current_block - stake.last_update <= lock_duration)
      "
      style="margin-bottom: 25px;"
    >
      <div class="loader-ring" v-if="proccess > 0 && proccess < 3"></div>
      &nbsp;
      <template v-if="stake.status == 1">Deactivate</template>
      <template v-else-if="stake.status == 2">Withdraw</template>
    </RButton>

    <p v-if="tx">
      <b>Watch Tx:&nbsp;</b>
      <a :href="`https://etherscan.io/tx/${tx}`" target="_blank">{{ tx }}</a>
    </p>

    <p v-if="proccess === 4">Success</p>
  </section>
</template>

<script>
import config from "../config";
import SubscriptionAbi from "../abi/Subscription.json";

const STATUS = {
  EMPTY: 0,
  BTN: 1,
  TX: 2,
  SUCCESS: 3,
  FINISH: 4
};

export default {
  props: ["stake", "current_block", "lock_duration"],
  data() {
    return {
      proccess: STATUS.EMPTY,
      tx: null
    };
  },
  methods: {
    run() {
      if (this.stake.status == 1) {
        this.deactivate();
      } else if (this.stake.status == 2) {
        this.withdraw();
      }
    },
    deactivate() {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        SubscriptionAbi,
        config.SUBSCRIPTION
      );
      return contract.methods
        .deactivate()
        .send(
          { from: this.$robonomics.account.address },
          (error, transactionHash) => {
            if (error) {
              return;
            }
            this.proccess = STATUS.TX;
            this.tx = transactionHash;
          }
        )
        .then(() => {
          setTimeout(() => {
            this.tx = null;
            this.proccess = STATUS.FINISH;
          }, 3000);
        })
        .catch(() => {
          this.proccess = STATUS.EMPTY;
        });
    },
    withdraw() {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        SubscriptionAbi,
        config.SUBSCRIPTION
      );
      return contract.methods
        .withdraw()
        .send(
          { from: this.$robonomics.account.address },
          (error, transactionHash) => {
            if (error) {
              return;
            }
            this.proccess = STATUS.TX;
            this.tx = transactionHash;
          }
        )
        .then(() => {
          setTimeout(() => {
            this.tx = null;
            this.proccess = STATUS.FINISH;
          }, 3000);
        })
        .catch(() => {
          this.proccess = STATUS.EMPTY;
        });
    }
  }
};
</script>
