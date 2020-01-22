import { Token } from "robonomics-js";
import { number } from "../../RComponents/tools/utils";

export default {
  props: ["address", "toAddress", "onInitToken", "onFetch"],
  data() {
    return {
      token: null,
      symbol: "",
      decimals: "0",
      balance: "0",
      allowance: "0"
    };
  },
  created() {
    this.initToken(this.address).then(this.fetchData);
  },
  watch: {
    address: function(newVal) {
      this.initToken(newVal).then(this.fetchData);
    }
  },
  methods: {
    async initToken(address) {
      this.token = new Token(this.$robonomics.web3, address);
      this.decimals = await this.token.methods.decimals().call();
      this.symbol = await this.token.methods.symbol().call();
      if (this.onInitToken) {
        this.onInitToken({
          decimals: this.decimals,
          symbol: this.symbol
        });
      }
    },
    async fetchData() {
      this.balance = await this.token.methods
        .balanceOf(this.$robonomics.account.address)
        .call();
      this.allowance = await this.token.methods
        .allowance(this.$robonomics.account.address, this.toAddress)
        .call();
      if (this.onFetch) {
        this.onFetch({
          balance: this.balance,
          allowance: this.allowance
        });
      }
    },
    approve(amount) {
      return this.token.methods
        .approve(this.toAddress, number.toWei(amount, this.decimals))
        .send({
          from: this.$robonomics.account.address
        });
    }
  }
};
