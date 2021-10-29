<template>
  <section>
    <ActivateForm ref="form" @onChange="onChange" @onSubmit="handleSubmit" />
    <br />
    <RButton
      size="big"
      fullWidth
      @click="$refs.form.submit()"
      :disabled="!canButton"
      style="margin-bottom: 25px"
    >
      <div class="loader-ring" v-if="proccess > 0 && proccess < 3"></div>
      <template v-else> Send</template>
    </RButton>

    <p v-if="tx">
      <b>Watch Tx:&nbsp;</b>
      <a :href="`https://etherscan.io/tx/${tx}`" target="_blank">{{ tx }}</a>
    </p>

    <p v-if="proccess === 4">Success</p>
  </section>
</template>

<script>
// import axios from "axios";
import config from "../config";
import AuctionAbi from "../abi/Auction.json";
import ActivateForm from "./ActivateForm";
import { number } from "../../../utils/tools";

const STATUS = {
  EMPTY: 0,
  BTN: 1,
  TX: 2,
  SUCCESS: 3,
  FINISH: 4
};

export default {
  components: {
    ActivateForm
  },
  data() {
    return {
      amount: "0",
      proccess: STATUS.EMPTY,
      tx: null,
      myBalance: 0
    };
  },
  created() {
    const watch = (blockNumber, cb) => {
      this.$robonomics.web3.eth.getBlockNumber(function (_, current) {
        if (current <= blockNumber) {
          setTimeout(function () {
            watch(blockNumber, cb);
          }, 1000);
        } else {
          cb();
          setTimeout(function () {
            watch(current, cb);
          }, 1000);
        }
      });
    };
    watch(null, async () => {
      this.$robonomics.web3.eth.getBalance(
        this.$robonomics.account.address,
        (e, r) => {
          if (this.myBalance !== r) {
            this.myBalance = r;
          }
        }
      );
    });
  },
  computed: {
    canButton: function () {
      if (Number(this.myBalance) < Number(this.amount)) {
        return false;
      }
      return (
        (this.proccess === 0 || this.proccess >= 3) && Number(this.amount) > 0
      );
    }
  },
  methods: {
    onChange({ fields }) {
      if (this.$refs.form.validate()) {
        this.amount = number.toWei(fields.amount.value, 18);
      }
    },
    handleSubmit({ error }) {
      if (!error) {
        this.subscribe(this.amount);
      }
    },
    // async getSignature() {
    //   try {
    //     const r = await axios.get(
    //       `http://localhost:3000/api/sign/${this.$robonomics.account.address}`
    //     );
    //     return r.data.result;
    //   } catch (_) {
    //     return null;
    //   }
    // },
    async subscribe(amount) {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        AuctionAbi,
        config.AUCTION
      );
      // const signature = await this.getSignature();
      // console.log(signature, amount);
      return contract.methods
        .bid()
        .send(
          { from: this.$robonomics.account.address, value: amount },
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
