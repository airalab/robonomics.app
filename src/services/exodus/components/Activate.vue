<template>
  <section>
    <blockquote>
      Amount of XRT which you want to shift from Ethereum mainnet to Robonomics
      Parachain (recommend you to read article
      <a
        href="https://blog.aira.life/foundation-of-the-robonomics-parachain-390dfac09e5d"
        target="_blank"
      >
        Robonomics Exodus
      </a>
      )
    </blockquote>
    <ActivateForm ref="form" @onChange="onChange" @onSubmit="handleSubmit" />
    <br />
    <RButton
      size="big"
      fullWidth
      @click="$refs.form.submit()"
      :disabled="!canButton"
      style="margin-bottom: 25px;"
    >
      <div class="loader-ring" v-if="proccess > 0 && proccess < 3"></div>
      &nbsp;
      <template v-if="!hasApprove">Approve</template>
      <template v-else>Send</template>
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
import ExodusAbi from "../abi/Exodus.json";
import ActivateForm from "./ActivateForm";
import { number } from "../../../utils/tools";

const STATUS = {
  EMPTY: 0,
  BTN: 1,
  TX: 2,
  SUCCESS: 3,
  FINISH: 4
};

export default {
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
      config.XRT,
      this.$robonomics.account.address,
      config.EXODUS
    );
  },
  computed: {
    myBalance: function () {
      return this.balance(config.XRT, this.$robonomics.account.address);
    },
    myAllowance: function () {
      return this.allowance(
        config.XRT,
        this.$robonomics.account.address,
        config.EXODUS
      );
    },
    hasApprove: function () {
      return Number(this.myAllowance) === Number(this.amount);
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
    myAllowance: function (value, oldValue) {
      if (oldValue === 0 && Number(value) > 0) {
        this.amount = value;
        this.$refs.form.fields.amount.value = number.fromWei(
          this.amount,
          9
          // this.token(config.XRT).decimals
        );
      }
    }
  },
  methods: {
    onChange({ fields }) {
      if (this.$refs.form.validate()) {
        this.amount = number.toWei(
          fields.amount.value,
          9
          // this.token(config.XRT).decimals
        );
      }
    },
    handleSubmit({ error, fields }) {
      if (!error) {
        if (!this.hasApprove) {
          this.approve(this.amount);
        } else {
          this.subscribe(this.amount, fields.account.value);
        }
      }
    },
    approve(amount) {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        TokenABI,
        config.XRT
      );
      console.log(config.XRT, config.EXODUS, amount);
      return contract.methods
        .approve(config.EXODUS, amount)
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
        .then((r) => {
          const watch = (blockNumber, cb) => {
            this.$robonomics.web3.eth.getBlockNumber(function (_, current) {
              if (current < blockNumber) {
                setTimeout(function () {
                  watch(blockNumber, cb);
                }, 1000);
              } else {
                cb();
              }
            });
          };
          watch(r.blockNumber, () => {
            this.tx = null;
            this.proccess = STATUS.SUCCESS;
          });
        })
        .catch(() => {
          this.proccess = STATUS.EMPTY;
        });
    },
    subscribe(amount, account) {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        ExodusAbi,
        config.EXODUS
      );
      console.log(amount, u8aToHex(decodeAddress(account)));
      return contract.methods
        .run(amount, u8aToHex(decodeAddress(account)))
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
        .then((r) => {
          const watch = (blockNumber, cb) => {
            this.$robonomics.web3.eth.getBlockNumber(function (_, current) {
              if (current < blockNumber) {
                setTimeout(function () {
                  watch(blockNumber, cb);
                }, 1000);
              } else {
                cb();
              }
            });
          };
          watch(r.blockNumber, () => {
            this.tx = null;
            this.proccess = STATUS.FINISH;
            this.$emit("upBurn");
          });
        })
        .catch(() => {
          this.proccess = STATUS.EMPTY;
        });
    }
  }
};
</script>
