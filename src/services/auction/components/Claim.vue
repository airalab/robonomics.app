<template>
  <section>
    <ClaimForm ref="form" @onSubmit="handleSubmit" />
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
      <template v-else>Claim XRT</template>
    </RButton>

    <p v-if="tx">
      <b>Watch Tx:&nbsp;</b>
      <a :href="`https://etherscan.io/tx/${tx}`" target="_blank">{{ tx }}</a>
    </p>

    <p v-if="proccess === 4">Success</p>
  </section>
</template>

<script>
import { u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import config from "../config";
import AuctionAbi from "../abi/Auction.json";
import ClaimForm from "./ClaimForm";

const STATUS = {
  EMPTY: 0,
  BTN: 1,
  TX: 2,
  SUCCESS: 3,
  FINISH: 4
};

export default {
  components: {
    ClaimForm
  },
  data() {
    return {
      amount: "0",
      proccess: STATUS.EMPTY,
      tx: null
    };
  },
  computed: {
    canButton: function () {
      return this.proccess === 0 || this.proccess >= 3;
    }
  },
  methods: {
    handleSubmit({ error, fields }) {
      if (!error) {
        this.claim(fields.account.value);
      }
    },
    async claim(account) {
      this.proccess = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        AuctionAbi,
        config.AUCTION
      );
      return contract.methods
        .claimTokens(u8aToHex(decodeAddress(account)))
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
            this.proccess = STATUS.FINISH;
            this.$emit("exodus", { account, tx: this.tx });
            this.tx = null;
          });
        })
        .catch(() => {
          this.proccess = STATUS.EMPTY;
        });
    }
  }
};
</script>
