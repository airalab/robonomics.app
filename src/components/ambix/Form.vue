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
      <span class="input-measure">{{fromLabel}}</span>
    </div>
    <button v-if="$wait.is([actionForm, actionTx])" class="container-full" disabled>
      <span class="align-vertical">{{ $t('convert') }} {{toLabel}}</span>
      <div class="loader-ring align-vertical m-l-10"></div>
    </button>
    <button v-else class="container-full" @click="submit">{{ $t('convert') }} {{toLabel}}</button>
    <p v-if="$wait.is([actionForm, actionTx]) && actionTx" class="t-sm">
      Wait for
      <a
        :href="`https://etherscan.io/tx/${actionTx.replace('tx.', '')}`"
        target="_blank"
      >transaction</a> to be mined
    </p>
    <p v-if="error!==''" class="t-sm">{{error}}</p>
  </form>
</template>

<script>
import axios from "axios";
import _has from "lodash/has";
import { toWei, fromWei } from "../../utils/utils";
import TokenABI from "../../abi/Token.json";
import AmbixABI from "../../abi/Ambix.json";
import config from "../../config";

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
      amount: 1
    };
  },
  mounted() {
    if (this.current > 0) {
      this.amount = fromWei(this.current, this.decimals);
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
    watchTx(value) {
      if (!value) {
        if (/^approve/.test(this.actionForm)) {
          this.run();
        } else if (/^unapprove/.test(this.actionForm)) {
          this.submit();
        }
      }
    }
  },
  methods: {
    submit() {
      this.error = "";
      this.success = "";
      if (this.amount > 0) {
        const value = Number(toWei(this.amount, this.decimals));
        if (value === this.current) {
          if (value <= this.balance) {
            this.run();
          } else {
            this.error = "Error: max " + fromWei(this.balance, this.decimals);
          }
        } else if (value > this.current) {
          if (value <= this.balance) {
            this.approve(value - this.current);
          } else {
            this.error = "Error: max " + fromWei(this.balance, this.decimals);
          }
        } else {
          // a < this.current
          this.unapprove();
        }
      }
      return false;
    },
    approve(value) {
      this.actionForm = "approve." + this.token + this.ambix;
      this.$wait.start(this.actionForm);
      this.actionTx = "";
      const contract = web3.eth.contract(TokenABI).at(this.token);
      contract.approve(
        this.ambix,
        toWei(value, this.decimals),
        { from: web3.eth.accounts[0] },
        (e, r) => {
          if (e) {
            this.$wait.end(this.actionForm);
            return;
          }
          this.$wait.end(this.actionForm);
          this.tx = r;
          this.actionTx = "tx." + this.tx;
          this.$wait.start(this.actionTx);
        }
      );
    },
    unapprove() {
      this.actionForm = "unapprove." + this.token + this.ambix;
      this.$wait.start(this.actionForm);
      this.actionTx = "";
      const contract = web3.eth.contract(TokenABI).at(this.token);
      contract.unapprove(this.ambix, { from: web3.eth.accounts[0] }, (e, r) => {
        if (e) {
          this.$wait.end(this.actionForm);
          return;
        }
        this.$wait.end(this.actionForm);
        this.tx = r;
        this.actionTx = "tx." + this.tx;
        this.$wait.start(this.actionTx);
      });
    },
    run() {
      this.actionForm = "ambix." + this.ambix;
      this.$wait.start(this.actionForm);
      this.actionTx = "";
      const ambix = web3.eth.contract(AmbixABI).at(this.ambix);
      axios
        .get(
          config.API_KYC + "/sign/" + this.ambix + "/" + web3.eth.accounts[0]
        )
        .then(r => {
          if (_has(r.data, "result")) {
            const signature = r.data.result;
            ambix.run(
              this.index,
              signature,
              { from: web3.eth.accounts[0] },
              (e, r) => {
                if (e) {
                  this.$wait.end(this.actionForm);
                  return;
                }
                this.$wait.end(this.actionForm);
                this.tx = r;
                this.actionTx = "tx." + this.tx;
                this.$wait.start(this.actionTx);
              }
            );
          } else {
            this.$wait.end(this.actionForm);
          }
        })
        .catch(() => {
          this.$wait.end(this.actionForm);
        });
    }
  }
};
</script>
