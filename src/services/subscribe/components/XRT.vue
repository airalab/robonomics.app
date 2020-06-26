<template>
  <div>
    <RButton
      size="big"
      fullWidth
      @click="run"
      :disabled="!canButton"
      style="margin-bottom: 25px;"
    >
      <div class="loader-ring" v-if="proccess > 0 && proccess < 4"></div>
      &nbsp;Subscribe
    </RButton>
    <p>
      <b>Price:</b>
      {{ $robonomics.web3.utils.fromWei(price.toString(), "gwei") }} XRT
    </p>
    <p>
      <b>Balance RWS:</b>
      {{ $robonomics.web3.utils.fromWei(balanceRws.toString()) }} RWS
    </p>
    <p>
      <b>Balance XRT:</b>
      {{ $robonomics.web3.utils.fromWei(balanceXrt.toString(), "gwei") }} XRT
    </p>
    <p>
      <b>Approve</b>:
      <span v-if="hasApprove">+</span>
      <span v-else>-</span>
    </p>
    <p>
      <b>Subscribe</b>:
      <span v-if="proccess === 4">+</span>
      <span v-else>-</span>
    </p>
    <p v-if="proccess === 3">Success</p>
    <p v-if="tx">
      <b>Watch Tx:&nbsp;</b>
      <a :href="`https://etherscan.io/tx/${tx}`" target="_blank">{{ tx }}</a>
    </p>
  </div>
</template>

<script>
import config from "../config";
import TokenABI from "../abi/Token.json";
import RouterAbi from "../abi/Router.json";
import { getToken, getAllPairs, getPrice } from "../tools/uniswap";

const STATUS = {
  EMPTY: 0,
  BTN: 1,
  TX: 2,
  SUCCESS: 3,
  FINISH: 4
};

export default {
  props: ["value"],
  data() {
    return {
      price: 0,
      allowance: 0,
      balanceRws: 0,
      balanceXrt: 0,
      proccess: STATUS.EMPTY,
      tx: null
    };
  },
  computed: {
    canButton: function () {
      if (Number(this.balanceXrt) < Number(this.price)) {
        return false;
      }
      if (!this.hasApprove) {
        return false;
      }
      return this.proccess === 0 && Number(this.amount) > 0;
    },
    hasApprove: function () {
      return Number(this.allowance) >= Number(this.price);
    },
    amount: function () {
      return this.value.toString().trim() === "" ? "0" : this.value;
    }
  },
  watch: {
    async amount() {
      await this.setPrice(this.amount);
    }
  },
  async created() {
    await this.setPrice(this.amount);
    await this.getAllowance();
    this.balanceRws = await this.getBalance(config.RWS);
    this.balanceXrt = await this.getBalance(config.XRT);
  },
  methods: {
    async setPrice(amount) {
      const rws = getToken(config.RWS, 18, "RWS", "RWS");
      const xrt = getToken(config.XRT, 9, "XRT", "XRT");
      const pairs = await getAllPairs(this.$robonomics.web3, xrt, rws);
      this.price = await getPrice(
        pairs,
        xrt,
        rws,
        this.$robonomics.web3.utils.toWei(amount.toString())
      );
    },
    getBalance(token) {
      const contract = new this.$robonomics.web3.eth.Contract(TokenABI, token);
      return contract.methods
        .balanceOf(this.$robonomics.account.address)
        .call();
    },
    getAllowance() {
      const contract = new this.$robonomics.web3.eth.Contract(
        TokenABI,
        config.XRT
      );
      return contract.methods
        .allowance(this.$robonomics.account.address, config.ROUTER)
        .call()
        .then((r) => {
          this.allowance = r;
        });
    },
    run() {
      if (!this.hasApprove) {
        this.approve();
      } else {
        this.subscribe();
      }
    },
    approve() {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        TokenABI,
        config.XRT
      );
      return contract.methods
        .approve(
          config.ROUTER,
          "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        )
        .send(
          {
            from: this.$robonomics.account.address
          },
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
            this.getAllowance();
            this.tx = null;
            this.proccess = STATUS.SUCCESS;
            this.subscribe();
          }, 3000);
        })
        .catch(() => {
          this.proccess = STATUS.EMPTY;
        });
    },
    subscribe() {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        RouterAbi,
        config.ROUTER
      );

      const args = [
        this.price,
        this.$robonomics.web3.utils.toWei(this.amount.toString()),
        [config.XRT, config.RWS],
        this.$robonomics.account.address,
        Math.ceil(Date.now() / 1000) + 60 * 20
      ];

      return contract.methods
        .swapExactTokensForTokens(...args)
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
            this.getBalance(config.RWS).then((r) => (this.balanceRws = r));
            this.getBalance(config.XRT).then((r) => (this.balanceXrt = r));
            this.getAllowance();
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
