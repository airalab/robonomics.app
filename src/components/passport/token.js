import { Token } from "robonomics-js";

export default {
  props: ["address", "onInitToken"],
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
    this.initToken(this.address);
  },
  watch: {
    address: function(newVal) {
      this.initToken(newVal);
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
    }
  }
};
