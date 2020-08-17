<template>
  <section>
    <h3>Swap RWS tokens to Robonomics tps</h3>
    <ActivateForm ref="form" @onChange="onChange" @onSubmit="handleSubmit" />
    <br />
    <RButton
      size="big"
      fullWidth
      @click="$refs.form.submit()"
      :disabled="!canButton"
      style="margin-bottom: 25px;"
    >
      <div class="loader-ring" v-if="proccess > 0 && proccess < 3"></div>&nbsp;
      <template v-if="!hasApprove">Approve</template>
      <template v-else>Activate</template>
    </RButton>

    <p v-if="tx">
      <b>Watch Tx:&nbsp;</b>
      <a :href="`https://etherscan.io/tx/${tx}`" target="_blank">{{ tx }}</a>
    </p>

    <p v-if="proccess === 4">Success</p>
  </section>
</template>

<script>
import token from "@/mixins/token";
import { u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import config from "../config";
import TokenABI from "../abi/Token.json";
import SubscriptionAbi from "../abi/Subscription.json";
import ActivateForm from "./ActivateForm";

const STATUS = {
  EMPTY: 0,
  BTN: 1,
  TX: 2,
  SUCCESS: 3,
  FINISH: 4
};

export default {
  props: ["account"],
  mixins: [token],
  components: {
    ActivateForm
  },
  data() {
    return {
      amount: "0",
      proccess: STATUS.EMPTY,
      tx: null
    };
  },
  created() {
    this.watchToken(
      config.RWS,
      this.$robonomics.account.address,
      config.SUBSCRIPTION
    );
  },
  mounted() {
    if (Number(this.myBalance) > 0) {
      this.$refs.form.fields.amount.value = this.$robonomics.web3.utils.fromWei(
        this.myBalance
      );
    }
    if (this.account) {
      this.$refs.form.fields.account.value = this.account;
    }
  },
  computed: {
    myBalance: function () {
      return this.balance(config.RWS, this.$robonomics.account.address);
    },
    myAllowance: function () {
      return this.allowance(
        config.RWS,
        this.$robonomics.account.address,
        config.SUBSCRIPTION
      );
    },
    hasApprove: function () {
      return Number(this.myAllowance) > Number(this.amount);
    },
    canButton: function () {
      if (Number(this.myBalance) < Number(this.amount)) {
        return false;
      }
      return (
        (this.proccess === 0 || this.proccess >= 3) && Number(this.amount) > 0
      );
    }
  },
  watch: {
    myBalance: function (value, oldValue) {
      if (oldValue === 0 && Number(value) > 0) {
        this.amount = value;
        this.$refs.form.fields.amount.value = this.$robonomics.web3.utils.fromWei(
          this.amount
        );
      }
    },
    account: function (value, oldValue) {
      if (value !== oldValue) {
        this.$refs.form.fields.account.value = this.account;
      }
    }
  },
  methods: {
    onChange({ fields }) {
      if (this.$refs.form.validate()) {
        this.amount = this.$robonomics.web3.utils.toWei(fields.amount.value);
        this.$emit("account", fields.account.value);
      }
    },
    handleSubmit({ error, fields }) {
      if (!error) {
        if (!this.hasApprove) {
          this.approve();
        } else {
          this.subscribe(this.amount, fields.account.value);
        }
      }
    },
    approve() {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        TokenABI,
        config.RWS
      );
      return contract.methods
        .approve(
          config.SUBSCRIPTION,
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
            this.tx = null;
            this.proccess = STATUS.SUCCESS;
          }, 3000);
        })
        .catch(() => {
          this.proccess = STATUS.EMPTY;
        });
    },
    subscribe(amount, account) {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        SubscriptionAbi,
        config.SUBSCRIPTION
      );
      return contract.methods
        .activate(amount, u8aToHex(decodeAddress(account)))
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
