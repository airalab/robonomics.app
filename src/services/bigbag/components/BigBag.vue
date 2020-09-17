<template>
  <fragment>
    <template v-if="isLoad">...</template>
    <template v-else>
      <template v-if="isCorrect">
        <h2>Smart contract found, you can double check source code on</h2>
        <p>
          Etherscan:
          <a :href="`https://etherscan.io/address/${address}`" target="_blank">
            {{ address }}
          </a>
        </p>
        <p>
          Aragon DAO agent address:
          <a
            :href="`https://etherscan.io/address/${dao_agent}`"
            target="_blank"
          >
            {{ dao_agent }}
          </a>
        </p>
        <p>
          Amount of XRT for sale: <b>{{ amountWnFormat }}</b>
        </p>
        <p>
          Exchange rate: <b>{{ priceFormat }}</b> / XRT
        </p>
        <p>
          Total: <b>{{ amountWeiFormat }}</b>
        </p>
        <Activate :contract="address" :amount_wei="amount_wei" />
      </template>
      <span v-else class="red"><b>Please check the contract address</b></span>
    </template>
  </fragment>
</template>

<script>
import utils from "web3-utils";
import Activate from "./Activate";
import BigBagAbi from "../abi/BigBag.json";

export default {
  props: ["address"],
  components: {
    Activate
  },
  data() {
    return {
      isLoad: true,
      isCorrect: false,
      amount_wei: "0",
      amount_wn: "0",
      price: "0",
      dao_agent: "0xe40c0c4f8e2424c74e13a301c133ce8b80d90549"
    };
  },
  created() {
    this.getPrice();
  },
  watch: {
    address: function () {
      this.getPrice();
    }
  },
  computed: {
    amountWeiFormat: function () {
      return this.$options.filters.fromWei(this.amount_wei, 18, "ETH");
    },
    amountWnFormat: function () {
      return this.$options.filters.fromWei(this.amount_wn, 9, "XRT");
    },
    priceFormat: function () {
      return this.price + " ETH";
    }
  },
  methods: {
    async getPrice() {
      this.isLoad = true;
      const contract = new this.$robonomics.web3.eth.Contract(
        BigBagAbi,
        this.address
      );
      try {
        this.amount_wei = await contract.methods.amount_wei().call();
        this.amount_wn = await contract.methods.amount_wn().call();
        this.price =
          Number(utils.fromWei(this.amount_wei)) /
          Number(utils.fromWei(this.amount_wn, "GWei"));
        this.isCorrect = true;
      } catch (_) {
        this.isCorrect = false;
      }
      this.isLoad = false;
    }
  }
};
</script>
