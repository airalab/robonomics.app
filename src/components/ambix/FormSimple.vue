<template>
  <form class="content">
    <div v-if="$wait.is('log')">...</div>
    <div class="input-measured container-full">
      <input
        v-model="amount"
        class="container-full"
        type="text"
        placeholder
        :disabled="$wait.is([actionForm, actionTx])"
      />
      <span class="input-measure">{{ fromLabel }}</span>
    </div>
    <RButton v-if="$wait.is([actionForm, actionTx])" full disabled>
      <span class="align-vertical">{{ $t("convert") }} {{ toLabel }}</span>
      <div class="loader-ring align-vertical m-l-10"></div>
    </RButton>
    <RButton v-else full @click.native="submit"
      >{{ $t("convert") }} {{ toLabel }}</RButton
    >
    <p v-if="$wait.is([actionForm, actionTx]) && actionTx" class="t-sm">
      Wait for
      <a
        :href="actionTx.replace('tx.', '') | urlChainExplorer('tx')"
        target="_blank"
        >transaction</a
      >
      to be mined
    </p>
    <p v-if="error !== ''" class="t-sm">{{ error }}</p>
  </form>
</template>

<script>
import { number } from "../../utils/tools";
import TokenABI from "../../abi/Token.json";
import AmbixSimpleABI from "../../abi/AmbixSimple.json";

export default {
  props: [
    "token",
    "decimals",
    "fromLabel",
    "toLabel",
    "current",
    "balance",
    "ambix",
    "index"
  ],
  data() {
    return {
      actionForm: "",
      actionTx: "",
      tx: "",
      valid: false,
      error: "",
      success: "",
      amount: "1"
    };
  },
  mounted() {
    if (this.current > 0) {
      this.amount = number.fromWei(this.current, this.decimals);
    }
  },
  computed: {
    watchTx: function() {
      if (this.actionTx !== "") {
        return this.$wait.is(this.actionTx);
      }
      return false;
    }
  },
  watch: {
    current: function(newVal) {
      if (newVal > 0) {
        this.amount = number.fromWei(newVal, this.decimals);
      }
    },
    watchTx(value) {
      if (!value) {
        if (/^approve/.test(this.actionForm)) {
          this.run();
        }
      }
    }
  },
  methods: {
    submit() {
      this.error = "";
      this.success = "";
      if (Number(this.amount) > 0) {
        const value = Number(number.toWei(this.amount, this.decimals));
        const approve = Number(this.current);
        const balance = Number(this.balance);
        if (value === approve) {
          if (value <= balance) {
            this.run();
          } else {
            this.error = "Error: max " + number.fromWei(balance, this.decimals);
          }
        } else {
          if (value <= balance) {
            this.approve(value);
          } else {
            this.error = "Error: max " + number.fromWei(balance, this.decimals);
          }
        }
      }
      return false;
    },
    approve(value) {
      this.actionForm = "approve." + this.token + this.ambix;
      this.$wait.start(this.actionForm);
      this.actionTx = "";
      const contract = new this.$robonomics.web3.eth.Contract(
        TokenABI,
        this.token
      );
      contract.methods
        .approve(this.ambix, value)
        .send({ from: this.$robonomics.account.address })
        .then(r => {
          this.$wait.end(this.actionForm);
          this.tx = r.transactionHash;
          this.actionTx = "tx." + this.tx;
          this.$wait.start(this.actionTx);
        })
        .catch(() => {
          this.$wait.end(this.actionForm);
        });
    },
    run() {
      this.actionForm = "ambix." + this.ambix;
      this.$wait.start(this.actionForm);
      this.actionTx = "";
      const ambix = new this.$robonomics.web3.eth.Contract(
        AmbixSimpleABI,
        this.ambix
      );
      ambix.methods
        .run(this.index)
        .send({ from: this.$robonomics.account.address })
        .then(r => {
          this.$wait.end(this.actionForm);
          this.tx = r.transactionHash;
          this.actionTx = "tx." + this.tx;
          this.$wait.start(this.actionTx);
        })
        .catch(() => {
          this.$wait.end(this.actionForm);
        });
    }
  }
};
</script>
