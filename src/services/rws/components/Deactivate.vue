<template>
  <section>
    <h3>Swap RWS tokens to Robonomics tps</h3>
    <RButton
      size="big"
      fullWidth
      @click="run"
      :disabled="isDisabledButton"
      style="margin-bottom: 25px"
    >
      <div class="loader-ring" v-if="isLoader"></div>
      &nbsp;
      <template v-if="stake.status == 1">Deactivate</template>
      <template v-else-if="stake.status == 2">
        <template v-if="isLocked">
          <div class="loader-ring"></div>
          &nbsp;&nbsp; Timeout block <b>{{ timeout }}</b>
        </template>
        <template v-else> Withdraw </template>
      </template>
    </RButton>

    <p v-if="tx">
      <b>Watch Tx:&nbsp;</b>
      <a :href="`https://etherscan.io/tx/${tx}`" target="_blank">{{ tx }}</a>
    </p>

    <div class="t-align--center">
      <b class="green" v-if="isSuccess">Success</b>
    </div>
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
  watch: {
    "stake.status": function (newV, oldV) {
      console.log(newV, oldV);
      this.proccess = STATUS.EMPTY;
    }
  },
  computed: {
    isSuccess: function () {
      return this.proccess === 4;
    },
    isLoader: function () {
      return this.proccess > 0 && this.proccess < 3;
    },
    isLocked: function () {
      return this.stake.status == 2 && this.isLockWithdraw;
    },
    isDisabledButton: function () {
      return this.isLoader || this.isLocked;
    },
    isLockWithdraw: function () {
      return this.passed <= Number(this.lock_duration);
    },
    passed: function () {
      return Number(this.current_block) - Number(this.stake.last_update);
    },
    timeout: function () {
      return Number(this.lock_duration) + 1 - this.passed;
    }
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
            setTimeout(() => {
              this.proccess = STATUS.EMPTY;
            }, 3000);
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
            setTimeout(() => {
              this.proccess = STATUS.EMPTY;
            }, 3000);
          }, 3000);
        })
        .catch(() => {
          this.proccess = STATUS.EMPTY;
        });
    }
  }
};
</script>
