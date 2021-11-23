<template>
  <section class="section-light">
    <h3>Apply for the transferring ERC-20 XRT to Robonomics Parachain</h3>
    <form v-on:submit.prevent="submit">
      <section
        :class="{
          disabled: process
        }"
      >
        <label class="container-full">
          1. Ethereum account:
          <p class="tip">
            In your browser wallet choose Ethereum account with XRT you want to
            transfer
          </p>
        </label>

        <template v-if="$robonomics.account">
          <div :class="{ error: Number(myBalance) === 0 }">
            <div class="account-balance">
              <RAvatar
                :address="$robonomics.account.address"
                class="account-balance-pic"
              />
              <span
                >{{ $robonomics.account.address.substr(0, 6) }}...{{
                  $robonomics.account.address.substr(-6)
                }}</span
              >
              –
              <span>{{ myBalanceFormat }} XRT</span>
            </div>
            <p v-if="Number(myBalance) === 0">No XRT found here</p>
          </div>
        </template>

        <button v-else @click.stop="$web3.initAccount()" class="btn-outline">
          Connect your Ethereum account
        </button>
      </section>

      <section
        :class="{
          disabled:
            process || $robonomics.account === null || Number(myBalance) === 0
        }"
      >
        <label class="container-full">
          2. Parachain account:
          <p class="tip">Polkadot.js extension required</p>
        </label>
        <p v-if="accounts.length === 0" class="error">
          Connected accounts in Polkadot.js extension not found. Please, connect
          your account and continue.
        </p>
        <div v-else>
          <div class="account-balance">
            <Identicon
              class="account-balance-pic"
              :size="36"
              :theme="'polkadot'"
              :value="fields.account.value"
            />

            <select
              v-model="fields.account.value"
              :class="{ error: fields.account.error }"
            >
              <option
                v-for="(account, k) in accounts"
                :key="k"
                :value="account.address"
              >
                {{ account.meta.name }} -
                {{ account.address.substr(0, 6) }}...{{
                  account.address.substr(-6)
                }}
              </option>
            </select>
          </div>
        </div>
      </section>

      <section
        :class="{
          disabled:
            accounts.length === 0 ||
            process ||
            fields.account.error ||
            $robonomics.account === null ||
            Number(myBalance) === 0
        }"
      >
        <label>3. Value to transfer</label>
        <p class="tip">
          You need some amount of ETH to pay for transactions fee: 1) approving;
          2) applying
        </p>
        <div :class="{ error: fields.amount.error }">
          <div class="input-measured">
            <input
              v-model="fields.amount.value"
              type="text"
              placeholder
              class="container-full"
            /><span class="input-measure">XRT</span>
          </div>
          <!-- <p>Insufficient balance on the selected Ethereum account</p> -->

          <template v-if="Number(fields.amount.value) > 0">
            <button
              v-if="hasApprove"
              class="btn-outline m-l-10 green"
              @click.stop.prevent=""
            >
              <span class="i-check"></span>Approved
              {{ fields.amount.value }} XRT
            </button>
            <template v-else>
              <button
                v-if="process === 0 || process === 4"
                class="btn-outline m-l-10"
                @click.stop.prevent="approve"
              >
                Approve {{ fields.amount.value }} XRT
              </button>
              <button v-else class="btn-outline m-l-10 disabled">
                <span class="loader-ring"></span>Approving
                {{ fields.amount.value }} XRT
              </button>
            </template>
          </template>
          <div>
            <a href="" class="a-dashed" @click.stop.prevent="setMax"
              >Apply maximum</a
            >
          </div>
        </div>
      </section>

      <section>
        <button v-if="process < 4" class="lg" :class="{ disabled: !canButton }">
          <template v-if="hasApprove && process > 0 && process < 3"
            >Applying
          </template>
          <template v-else>Apply </template>
          <div
            class="loader-ring"
            v-if="hasApprove && process > 0 && process < 3"
          ></div>
        </button>

        <template v-if="process === 4">
          <p>
            <button class="lg btn-green" disabled>
              Your application accepted
              <div class="i-check"></div>
            </button>
          </p>

          <button class="btn-outline" @click.stop.prevent="clearForm">
            Apply more
          </button>
        </template>
      </section>
    </form>
  </section>
</template>

<script>
import token from "@/mixins/token";
import robonomicsVC from "robonomics-vc";
import { checkAddress } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import config from "../config";
import TokenABI from "../abi/Token.json";
import ExodusAbi from "../abi/Exodus.json";
import { number } from "../../../utils/tools";
import { getInstance } from "@/utils/substrate";
import Identicon from "@polkadot/vue-identicon";

const STATUS = {
  EMPTY: 0,
  BTN: 1,
  TX: 2,
  SUCCESS: 3,
  FINISH: 4
};

export default {
  mixins: [robonomicsVC.mixins.form, token],
  components: { Identicon },
  data() {
    return {
      fields: {
        amount: {
          value: "0",
          type: "text",
          rules: ["require", "number", (v) => v > 0],
          error: false
        },
        account: {
          value: "",
          type: "text",
          rules: [
            "require",
            robonomicsVC.validators.length(48),
            (v) => {
              return checkAddress(v, 32)[0];
            }
          ],
          error: false
        }
      },
      amount: "0",
      process: STATUS.EMPTY,
      tx: null,
      robonomics: null,
      accounts: []
    };
  },
  async created() {
    if (this.$robonomics.account) {
      this.watchToken(
        config.XRT,
        this.$robonomics.account.address,
        config.EXODUS
      );
    }

    this.robonomics = await getInstance(config.CHAIN, false);
    this.robonomics.accountManager.onReady((e) => {
      if (e) {
        console.log(e.message);
        return;
      }
      this.loadAccounts();
      this.robonomics.accountManager.onChange((account) => {
        this.fields.account.value = account.address;
      });
    });

    this.$on("onChange", this.onChange);
    this.$on("onSubmit", this.handleSubmit);
  },
  computed: {
    myBalance: function () {
      return this.$robonomics.account
        ? this.balance(config.XRT, this.$robonomics.account.address)
        : 0;
    },
    myAllowance: function () {
      return this.$robonomics.account
        ? this.allowance(
            config.XRT,
            this.$robonomics.account.address,
            config.EXODUS
          )
        : 0;
    },
    hasApprove: function () {
      return Number(this.myAllowance) >= Number(this.amount);
    },
    canButton: function () {
      if (Number(this.myBalance) < Number(this.amount)) {
        return false;
      }
      return (
        this.hasApprove &&
        (this.process === 0 || this.process >= 3) &&
        Number(this.amount) > 0
      );
    },
    myBalanceFormat: function () {
      return this.$options.filters
        .fromWei(this.myBalance, 9, "")
        .replace(/\d(?=(\d{3})+\.)/g, "$& ");
    }
  },
  watch: {
    myAllowance: function (value, oldValue) {
      if (oldValue === 0 && Number(value) > 0) {
        this.amount = value;
        this.fields.amount.value = number.fromWei(
          this.amount,
          9
          // this.token(config.XRT).decimals
        );
      }
    }
  },
  methods: {
    async loadAccounts() {
      this.accounts = this.robonomics.accountManager.getAccounts();
      if (this.accounts.length) {
        this.fields.account.value = this.accounts[0].address;
      }
    },
    onChange({ fields }) {
      if (this.validate()) {
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
          this.approve();
        } else {
          this.subscribe(this.amount, fields.account.value);
        }
      }
    },
    approve() {
      const amount = this.amount;
      this.process = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        TokenABI,
        config.XRT
      );
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
            this.process = STATUS.TX;
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
            this.process = STATUS.SUCCESS;
          });
        })
        .catch(() => {
          this.process = STATUS.EMPTY;
        });
    },
    clearForm() {
      this.process = STATUS.EMPTY;
    },
    setMax() {
      this.fields.amount.value = this.$options.filters.fromWei(
        this.myBalance,
        9,
        ""
      );
    },
    subscribe(amount, account) {
      this.process = STATUS.BTN;
      const contract = new this.$robonomics.web3.eth.Contract(
        ExodusAbi,
        config.EXODUS
      );
      return contract.methods
        .run(amount, u8aToHex(decodeAddress(account)))
        .send(
          { from: this.$robonomics.account.address },
          (error, transactionHash) => {
            if (error) {
              return;
            }
            this.process = STATUS.TX;
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
            this.process = STATUS.FINISH;
            this.$emit("up-burn");
          });
        })
        .catch(() => {
          this.process = STATUS.EMPTY;
        });
    }
  }
};
</script>
