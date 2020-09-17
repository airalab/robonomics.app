<template>
  <section>
    <blockquote>
      p.s.: please don't use smart contracts to interact with the Big Bag sales
      smart contract! Send transactions only from your external owned account.
      You can use Metamask accounts, Nano Ledger, Trezor. You will receive the
      total amount of XRT automatically when the transaction will be mined.
    </blockquote>
    <br />
    <RButton
      size="big"
      fullWidth
      @click="send"
      :disabled="!canButton"
      style="margin-bottom: 25px;"
    >
      <div class="loader-ring" v-if="proccess > 0 && proccess < 3"></div>
      &nbsp; Send transaction
    </RButton>

    <p v-if="tx">
      <b>Watch Tx:&nbsp;</b>
      <a :href="`https://etherscan.io/tx/${tx}`" target="_blank">{{ tx }}</a>
    </p>

    <p v-if="proccess === 4" class="green"><b>Success</b></p>
  </section>
</template>

<script>
import BigBagAbi from "../abi/BigBag";
const STATUS = {
  EMPTY: 0,
  BTN: 1,
  TX: 2,
  SUCCESS: 3,
  FINISH: 4
};

export default {
  props: ["contract", "amount_wei"],
  data() {
    return {
      balance: "0",
      proccess: STATUS.EMPTY,
      tx: null
    };
  },
  async created() {
    this.balance = await this.$robonomics.web3.eth.getBalance(
      this.$robonomics.account.address
    );
  },
  computed: {
    canButton: function () {
      if (Number(this.balance) < Number(this.amount_wei)) {
        return false;
      }
      return this.proccess === 0 || this.proccess >= 3;
    }
  },
  methods: {
    send() {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        BigBagAbi,
        this.contract
      );
      return (
        contract.methods
          .buy()
          .send(
            { from: this.$robonomics.account.address, value: this.amount_wei },
            (error, transactionHash) => {
              if (error) {
                return;
              }
              this.proccess = STATUS.TX;
              this.tx = transactionHash;
            }
          )

          /*return this.$robonomics.web3.eth
        .sendTransaction(
          {
            from: this.$robonomics.account.address,
            to: this.contract,
            value: this.amount_wei,
            gasLimit: "120000"
          },
          (error, transactionHash) => {
            if (error) {
              return;
            }
            this.proccess = STATUS.TX;
            this.tx = transactionHash;
          }
        )*/
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
              this.$emit("upBurn");
            });
          })
          .catch(() => {
            this.proccess = STATUS.EMPTY;
          })
      );
    }
  }
};
</script>
