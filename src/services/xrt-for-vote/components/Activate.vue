<template>
  <section>
    <template v-if="Number(myBalanceVote) === 0">
      <ActivateForm ref="form" @onChange="onChange" @onSubmit="handleSubmit" />
      <br />

      <RFormField>
        <RFieldLabel>You need</RFieldLabel>
        <div class="input-measured container-full">
          {{ amountXrtFormat }}
        </div>
      </RFormField>

      <RButton
        size="big"
        fullWidth
        @click="$refs.form.submit()"
        :disabled="!canButton"
        style="margin-bottom: 25px"
      >
        <div class="loader-ring" v-if="proccess > 0 && proccess < 3"></div>
        &nbsp;
        <template v-if="!hasApprove">Approve</template>
        <template v-else>Mint</template>
      </RButton>
    </template>
    <template v-else>
      <RButton
        size="big"
        fullWidth
        @click="exit"
        :disabled="!canButtonExit"
        style="margin-bottom: 25px"
      >
        <div class="loader-ring" v-if="proccess > 0 && proccess < 3"></div>
        &nbsp;
        <template>Exit</template>
      </RButton>
    </template>

    <p v-if="tx">
      <b>Watch Tx:&nbsp;</b>
      <a :href="`https://etherscan.io/tx/${tx}`" target="_blank">{{ tx }}</a>
    </p>

    <p v-if="proccess === 4">Success</p>
  </section>
</template>

<script>
import token from "@/mixins/token";
import config from "../config";
import TokenABI from "../abi/Token.json";
import MinterAbi from "../abi/Minter.json";
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
      amountVote: "0",
      amountXrt: "0",
      proccess: STATUS.EMPTY,
      tx: null
    };
  },
  created() {
    this.watchToken(
      config.XRT,
      this.$robonomics.account.address,
      config.MINTER
    );
    this.watchToken(config.VOTE, this.$robonomics.account.address);
  },
  computed: {
    myBalance: function () {
      return this.balance(config.XRT, this.$robonomics.account.address);
    },
    myBalanceVote: function () {
      return this.balance(config.VOTE, this.$robonomics.account.address);
    },
    myAllowance: function () {
      return this.allowance(
        config.XRT,
        this.$robonomics.account.address,
        config.MINTER
      );
    },
    amountXrtFormat: function () {
      return this.$options.filters.fromWei(this.amountXrt, 9, "XRT");
    },
    hasApprove: function () {
      return Number(this.myAllowance) >= Number(this.amountXrt);
    },
    canButton: function () {
      if (
        Number(this.myBalanceVote) > 0 ||
        Number(this.myBalance) < Number(this.amountXrt)
      ) {
        return false;
      }
      return this.proccess === 0 || this.proccess >= 3;
    },
    canButtonExit: function () {
      return this.proccess === 0 || this.proccess >= 3;
    }
  },
  methods: {
    onChange({ fields }) {
      if (this.$refs.form.validate()) {
        this.amountVote = number.toWei(fields.amount.value, 18);

        const contract = new this.$robonomics.web3.eth.Contract(
          MinterAbi,
          config.MINTER
        );
        contract.methods
          .votes_to_xrt(this.amountVote)
          .call()
          .then((r) => {
            this.amountXrt = r.xrt_amount;
          });
      }
    },
    handleSubmit({ error }) {
      if (!error) {
        if (!this.hasApprove) {
          this.approve();
        } else {
          this.mint(this.amountVote);
        }
      }
    },
    approve() {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        TokenABI,
        config.XRT
      );
      return contract.methods
        .approve(
          config.MINTER,
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
    mint(amount) {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        MinterAbi,
        config.MINTER
      );
      return contract.methods
        .mint(amount)
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
          });
        })
        .catch(() => {
          this.proccess = STATUS.EMPTY;
        });
    },
    exit() {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        MinterAbi,
        config.MINTER
      );
      return contract.methods
        .exit()
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
          });
        })
        .catch(() => {
          this.proccess = STATUS.EMPTY;
        });
    }
  }
};
</script>
