import { mapGetters } from "vuex";
import { getContract } from "../utils/token";

export default {
  computed: {
    ...mapGetters("tokens", [
      "token",
      "balanceFormat",
      "allowanceFormat",
      "balance",
      "allowance"
    ])
  },
  methods: {
    watchToken(address, from, to = null) {
      this.$store.dispatch("tokens/add", address);
      this.$store.dispatch("tokens/watchBalance", {
        token: address,
        account: from
      });
      if (to) {
        this.$store.dispatch("tokens/watchAllowance", {
          token: address,
          from,
          to
        });
      }
    },
    approve(address, value, from, to) {
      return getContract(address)
        .methods.approve(to, value)
        .send({ from });
    }
  }
};
