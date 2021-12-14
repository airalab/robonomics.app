<template>
  <section class="section-light">
    <h3>New bonding</h3>

    <form v-on:submit.prevent="submit">
      <section :class="{ disabled: process }">
        <label class="container-full">
          1. Account:
          <p class="tip">
            This account holds funds bonded for staking, signalling decisions,
            pays transaction fees, gets rewards
          </p>
        </label>

        <p v-if="accounts.length === 0" class="error">
          Connected accounts in Polkadot.js extension not found. Please, connect
          your account and continue.
        </p>
        <div v-else>
          <div class="account-balance">
            <Identicon
              class="account-balance-pic"
              :size="30"
              :theme="'polkadot'"
              :value="fields.stash.value"
            />

            <select
              v-model="fields.stash.value"
              :class="{ error: fields.stash.error }"
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

            <span
              ><Balance :account="fields.stash.value" @balance="handleBalance"
            /></span>
          </div>
        </div>
      </section>

      <section
        :class="{ disabled: process || fields.stash.error || balance <= 0 }"
      >
        <label>2. Value to be bonded</label>
        <p class="tip alert" v-if="balance >= 0 && accounts.length !== 0">
          Please save some XRT tokens for transaction fees, don't bond all your
          XRT. You will need it to operate with bonded tokens in the future:
          claim rewards, bond more, unbond.
        </p>

        <div :class="{ error: fields.value.error }">
          <div class="input-measured">
            <input
              v-model="fields.value.value"
              type="text"
              placeholder
              class="container-full"
            /><span class="input-measure">XRT</span>
          </div>
          <p v-if="(balance <= 0 || !maxBond) && accounts.length !== 0">
            Insufficient balance on choosen account. It needs to be at least the
            value you specified here plus supposed transaction fee.
          </p>
        </div>
      </section>

      <section>
        <template v-if="resultWrite === null">
          <button v-if="process" class="lg" disabled>
            Bonding
            <div class="loader-ring"></div>
          </button>
          <template v-else>
            <button v-if="canBond" class="lg">Bond</button>
            <button v-else class="lg disabled" disabled>Bond</button>
          </template>
        </template>
        <template v-else>
          <p>
            <button class="lg btn-green" disabled>
              Bonded
              <div class="i-check"></div>
            </button>
          </p>
          <ul>
            <li>
              <a
                :href="`https://robonomics.subscan.io/block/${resultWrite.blockNumber}`"
                target="_blank"
                >View Block</a
              >
            </li>
            <li>
              <a
                :href="`https://robonomics.subscan.io/extrinsic/${resultWrite.blockNumber}-${resultWrite.txIndex}`"
                target="_blank"
                >View Extrinsic</a
              >
            </li>
          </ul>
        </template>
        <div v-if="resultError" class="red mt15">{{ resultError }}</div>
      </section>
    </form>
  </section>
</template>

<script>
import { Robonomics } from "../../../utils/robonomics-substrate";
import { toUnit, toDecimal } from "../utils/utils";
import robonomicsVC from "robonomics-vc";
import Balance from "./Balance";
import config from "../config";
import Identicon from "@polkadot/vue-identicon";

export default {
  mixins: [robonomicsVC.mixins.form],
  components: { Balance, Identicon },
  data() {
    return {
      fields: {
        stash: {
          value: "",
          type: "select",
          rules: ["require"],
          error: false
        },
        value: {
          value: "0",
          type: "text",
          rules: [
            "require",
            (v) => Number(v) > 0,
            (v) => {
              return (
                this.balance >=
                Number(
                  toDecimal(
                    toUnit(v, this.robonomics.api.registry.chainDecimals)
                  ).add(
                    toDecimal(
                      toUnit(
                        config.REST,
                        this.robonomics.api.registry.chainDecimals
                      )
                    )
                  )
                )
              );
            }
          ],
          error: false
        }
      },
      robonomics: null,
      accounts: [],
      resultError: "",
      resultWrite: null,
      process: false,
      balance: ""
    };
  },
  async created() {
    this.robonomics = Robonomics.getInstance(config.CHAIN);
    this.robonomics.accountManager.onReady((e) => {
      if (e) {
        console.log(e.message);
        return;
      }
      this.loadAccounts();
      this.robonomics.accountManager.onChange((account) => {
        this.fields.stash.value = account.address;
      });
    });

    this.$on("onChange", this.onChange);
    this.$on("onSubmit", this.bond);
  },
  computed: {
    maxBond() {
      return (
        this.balance >=
        Number(
          toDecimal(
            toUnit(
              this.fields.value.value,
              this.robonomics.api.registry.chainDecimals
            )
          ).add(
            toDecimal(
              toUnit(config.REST, this.robonomics.api.registry.chainDecimals)
            )
          )
        )
      );
    },
    canBond() {
      return !this.error && this.balance > 0 && this.maxBond;
    }
  },
  methods: {
    onChange() {
      this.validate();
    },
    async loadAccounts() {
      this.accounts = this.robonomics.accountManager.getAccounts();
      if (this.accounts.length) {
        this.fields.stash.value = this.accounts[0].address;
      }
    },
    async bond() {
      if (!this.error) {
        try {
          this.process = true;
          this.resultError = "";
          this.resultWrite = null;
          await this.robonomics.accountManager.selectAccountByAddress(
            this.fields.stash.value
          );
          const tx = this.robonomics.staking.bond(
            this.fields.stash.value,
            toUnit(
              this.fields.value.value,
              this.robonomics.api.registry.chainDecimals
            )
          );
          this.resultWrite = await this.robonomics.accountManager.signAndSend(
            tx
          );
          this.$emit("result", this.resultWrite);
        } catch (error) {
          this.resultError = error.message;
          this.$emit("error", error.message);
        }
        this.process = false;
      }
    },
    handleBalance(result) {
      this.balance = Number(result.balance);
    }
  }
};
</script>

<style scoped>
.mt15 {
  margin-top: 15px;
}

.tip {
  max-width: 600px;
}

.tip.alert:before {
  content: "!";
  font-weight: bold;
  color: var(--color-blue);
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-blue);
  border-radius: 20px;
  text-align: center;
  margin-right: var(--space);
  float: left;
  clear: both;
}

.tip.alert {
  color: var(--color-blue);
}
</style>
