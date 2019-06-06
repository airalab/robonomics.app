<template>
  <div>
    <div v-if="$wait.is('log')">...</div>
    <p>
      <input v-model="amount" class="input-line input-size--sm" type="text" placeholder>
      <span>{{fromLabel}}</span>
    </p>
    <p>
      <button v-if="$wait.is([actionForm, actionTx])" class="btn-green" disabled>
        <span class="align-vertical">{{ $t('convert') }} {{toLabel}}</span>
        <div class="loader-ring align-vertical m-l-10"></div>
      </button>
      <button v-else class="btn-green" @click="submit">{{ $t('convert') }} {{toLabel}}</button>
    </p>
    <p v-if="$wait.is([actionForm, actionTx]) && actionTx" class="t-sm">
      Wait for
      <a
        :href="`https://etherscan.io/tx/${actionTx.replace('tx.', '')}`"
        target="_blank"
      >transaction</a> to be mined
    </p>
  </div>
</template>

<script>
import axios from "axios";
import _has from "lodash/has";
import { toWei, fromWei } from "../../utils/utils";
import TokenABI from "../../abi/Token.json";
import AmbixABI from "../../abi/Ambix.json";
import AmbixSimpleABI from "../../abi/AmbixSimple.json";
import config from "../../config";

export default {
  props: [
    "token",
    "decimals",
    "fromLabel",
    "toLabel",
    "current",
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
      amount: 1,
      requireRule: [v => !!v || "Field required"],
      amounRule: [
        v => !!v || "Field required",
        v => v > 0 || "Must be greater than 0"
      ]
    };
  },
  mounted() {
    if (this.current.num > 0) {
      this.amount = fromWei(this.current.num, this.decimals);
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
        }
      }
    }
  },
  methods: {
    submit() {
      this.error = "";
      this.success = "";
      if (this.amount > 0) {
        if (Number(toWei(this.amount, this.decimals)) !== this.current.num) {
          this.approve();
        } else {
          this.run();
        }
      }
      return false;
    },
    approve() {
      this.actionForm = "approve." + this.token + this.ambix;
      this.$wait.start(this.actionForm);
      this.actionTx = "";
      const contract = web3.eth.contract(TokenABI).at(this.token);
      contract.approve(
        this.ambix,
        toWei(this.amount, this.decimals),
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
    run() {
      if (this.ambix === config.AMBIX.AMBIX1) {
        this.runSigner();
      } else {
        this.runSimple();
      }
    },
    runSigner() {
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
    },
    runSimple() {
      this.actionForm = "ambix." + this.ambix;
      this.$wait.start(this.actionForm);
      this.actionTx = "";
      const ambix = web3.eth.contract(AmbixSimpleABI).at(this.ambix);
      ambix.run(this.index, { from: web3.eth.accounts[0] }, (e, r) => {
        if (e) {
          this.$wait.end(this.actionForm);
          return;
        }
        this.$wait.end(this.actionForm);
        this.tx = r;
        this.actionTx = "tx." + this.tx;
        this.$wait.start(this.actionTx);
      });
    }
  }
};
</script>
