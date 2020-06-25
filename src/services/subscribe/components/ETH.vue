<template>
  <div>
    <RButton
      size="big"
      fullWidth
      @click="subscribe"
      :disabled="proccess > 0"
      style="margin-bottom: 25px;"
    >
      <div class="loader-ring" v-if="proccess > 0"></div>
      &nbsp;Subscribe
    </RButton>
    <p>
      <b>Price</b>
      : {{ price }} ETH
    </p>
    <p>
      <b>Balance</b>
      : {{ balance }} ETH
    </p>
    <p v-if="proccess === 3">Success</p>
    <p v-if="tx">
      <b>Watch Tx:&nbsp;</b>
      <a :href="`https://etherscan.io/tx/${tx}`" target="_blank">{{ tx }}</a>
    </p>
  </div>
</template>

<script>
import { getToken, getAllPairs, getPrice } from "../tools/uniswap";
import config from "../config";
import SubscribeABI from "../abi/Subscribe.json";

const STATUS = {
  EMPTY: 0,
  BTN: 1,
  TX: 2,
  SUCCESS: 3
};

export default {
  props: ["currentPrice"],
  data() {
    return {
      price: 0,
      balance: 0,
      proccess: STATUS.EMPTY,
      tx: null
    };
  },
  async created() {
    this.price = this.$robonomics.web3.utils.fromWei(await this.course());
    await this.getBalance();
  },
  methods: {
    getBalance() {
      this.$robonomics.web3.eth.getBalance(
        this.$robonomics.account.address,
        (e, r) => {
          this.balance = this.$robonomics.web3.utils.fromWei(r);
        }
      );
    },
    async course() {
      const eth = getToken();
      const xrt = getToken(config.XRT, 9, "XRT", "XRT");

      const pairs = await getAllPairs(this.$robonomics.web3, eth, xrt);
      const price = await getPrice(pairs, eth, xrt, this.currentPrice);

      return price;
    },
    async subscribe() {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        SubscribeABI,
        config.SUBSCRIBE
      );
      const value = await this.course();
      return contract.methods
        .subscribe(Math.round(Date.now() / 1000 + 1000 * 60 * 24))
        .send(
          { from: this.$robonomics.account.address, value: value },
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
            this.getBalance();
            this.tx = null;
            this.step2 = true;
            this.proccess = STATUS.SUCCESS;
            setTimeout(() => {
              this.proccess = STATUS.EMPTY;
              this.$emit("subscribed");
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
