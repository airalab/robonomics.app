<template>
  <section>
    <RButton
      size="big"
      fullWidth
      @click="subscribe"
      :disabled="!canButton"
      style="margin-bottom: 25px;"
    >
      <div class="loader-ring" v-if="proccess > 0 && proccess < 3"></div>
      &nbsp;
      <template v-else>Claim tokens</template>
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
import AuctionAbi from "../abi/Auction.json";

const STATUS = {
  EMPTY: 0,
  BTN: 1,
  TX: 2,
  SUCCESS: 3,
  FINISH: 4
};

export default {
  data() {
    return {
      proccess: STATUS.EMPTY,
      tx: null
    };
  },
  computed: {
    canButton: function () {
      return this.proccess === 0 || this.proccess >= 3;
    }
  },
  methods: {
    async subscribe() {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        AuctionAbi,
        config.AUCTION
      );
      return contract.methods
        .claimTokens()
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
        .then((r) => {
          const watch = (blockNumber, cb) => {
            this.$robonomics.web3.eth.getBlockNumber(function (_, current) {
              if (current < blockNumber) {
                setTimeout(function () {
                  watch(blockNumber, cb);
                }, 1000);
              } else {
                cb();
              }
            });
          };
          watch(r.blockNumber, () => {
            this.tx = null;
            this.proccess = STATUS.FINISH;
            this.$emit("up");
          });
        })
        .catch(() => {
          this.proccess = STATUS.EMPTY;
        });
    }
  }
};
</script>
