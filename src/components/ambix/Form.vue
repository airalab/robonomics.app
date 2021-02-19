<template>
  <form class="content" v-on:submit.prevent="submit">
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
    <RButton v-if="$wait.is([actionForm, actionTx])" fullWidth disabled>
      <span class="align-vertical">{{ action }}</span>
      <div class="loader-ring align-vertical m-l-10"></div>
    </RButton>
    <RButton v-else fullWidth>{{ action }}</RButton>
    <p v-if="$wait.is([actionForm, actionTx]) && actionTx" class="t-sm">
      Wait for
      <a
        :href="actionTx.replace('tx.', '') | urlChainExplorer('tx')"
        target="_blank"
        >transaction</a
      >
      to be mined
    </p>
    <p></p>
    <p class="t-sm" :style="{ color: isApprove ? '#54CE63' : '#E84004' }">
      Current allowance: {{ current | fromWei(decimals, fromLabel) }}
    </p>
    <p v-if="error !== ''" class="t-sm" style="color: #e84004">{{ error }}</p>
    <p></p>
  </form>
</template>

<script>
import utils from "web3-utils";
import Account from "eth-lib/lib/account";
import { number } from "../../utils/tools";
import TokenABI from "../../abi/Token.json";
import AmbixABI from "../../abi/Ambix.json";
import config from "~config";

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
    } else if (this.balance > 0) {
      this.amount = number.fromWei(this.balance, this.decimals);
    }
  },
  computed: {
    watchTx: function () {
      if (this.actionTx !== "") {
        return this.$wait.is(this.actionTx);
      }
      return false;
    },
    isApprove: function () {
      if (Number(this.amount) > 0) {
        const value = Number(number.toWei(this.amount, this.decimals));
        const approve = Number(this.current);
        if (value === approve) {
          return true;
        }
      }
      return false;
    },
    action: function () {
      let text = "Error";
      if (Number(this.amount) > 0) {
        const value = Number(number.toWei(this.amount, this.decimals));
        const approve = Number(this.current);
        const balance = Number(this.balance);
        if (approve > balance) {
          text = this.$t("convert.unapprove") + " " + this.fromLabel;
        } else if (value === approve) {
          if (value <= balance) {
            text = this.$t("convert.convert") + " " + this.toLabel;
          }
        } else if (value > approve) {
          if (value <= balance) {
            text = this.$t("convert.approve") + " " + this.fromLabel;
          }
        } else {
          text = this.$t("convert.unapprove") + " " + this.fromLabel;
        }
      }
      return text;
    }
  },
  watch: {
    current: function (newVal) {
      if (newVal > 0) {
        this.amount = number.fromWei(newVal, this.decimals);
      }
    },
    balance: function (newVal) {
      if (newVal > 0 && this.current <= 0) {
        this.amount = number.fromWei(newVal, this.decimals);
      }
    },
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
      if (Number(this.amount) > 0) {
        const value = Number(number.toWei(this.amount, this.decimals));
        const approve = Number(this.current);
        const balance = Number(this.balance);
        if (approve > balance) {
          this.unapprove();
        } else if (value === approve) {
          if (value <= balance) {
            this.run();
          } else {
            this.error = "Error: max " + number.fromWei(balance, this.decimals);
          }
        } else if (value > approve) {
          if (value <= balance) {
            this.approve(value - approve);
          } else {
            this.error = "Error: max " + number.fromWei(balance, this.decimals);
          }
        } else {
          // a < approve
          this.unapprove();
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
        .send(
          { from: this.$robonomics.account.address },
          (error, transactionHash) => {
            if (error) {
              this.$wait.end(this.actionForm);
            } else {
              this.$wait.end(this.actionForm);
              this.tx = transactionHash;
              this.actionTx = "tx." + this.tx;
              this.$wait.start(this.actionTx);
            }
          }
        )
        .then((r) => {
          this.$wait.end("tx." + r.transactionHash);
        })
        .catch(() => {
          this.$wait.end(this.actionForm);
        });
    },
    unapprove() {
      this.actionForm = "unapprove." + this.token + this.ambix;
      this.$wait.start(this.actionForm);
      this.actionTx = "";
      const contract = new this.$robonomics.web3.eth.Contract(
        TokenABI,
        this.token
      );
      contract.methods
        .unapprove(this.ambix)
        .send(
          { from: this.$robonomics.account.address },
          (error, transactionHash) => {
            if (error) {
              this.$wait.end(this.actionForm);
            } else {
              this.$wait.end(this.actionForm);
              this.tx = transactionHash;
              this.actionTx = "tx." + this.tx;
              this.$wait.start(this.actionTx);
            }
          }
        )
        .then((r) => {
          this.$wait.end("tx." + r.transactionHash);
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
        AmbixABI,
        this.ambix
      );

      const hashMsgPrefix = (hash) => {
        return utils.soliditySha3(
          {
            type: "bytes",
            value: utils.stringToHex("\x19Ethereum Signed Message:\n32")
          },
          { type: "bytes", value: hash }
        );
      };
      const messageHex = hashMsgPrefix(
        utils.soliditySha3(this.ambix, this.$robonomics.account.address)
      );
      const signature = Account.sign(messageHex, config.AMBIX_PRIVATE);

      ambix.methods
        .run(this.index, signature)
        .send(
          { from: this.$robonomics.account.address },
          (error, transactionHash) => {
            if (error) {
              this.$wait.end(this.actionForm);
            } else {
              this.$wait.end(this.actionForm);
              this.tx = transactionHash;
              this.actionTx = "tx." + this.tx;
              this.$wait.start(this.actionTx);
            }
          }
        )
        .then((r) => {
          this.$wait.end("tx." + r.transactionHash);
        })
        .catch(() => {
          this.$wait.end(this.actionForm);
        });
    }
  }
};
</script>
