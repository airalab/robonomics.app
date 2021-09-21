<template>
  <form v-on:submit.prevent="submit">
    <section>
      <label
        >1. Your Kusama account participated in
        <a
          href="https://robonomics.network/kusama-slot/"
          target="_blank"
          rel="noopener"
          >Robonomics Crowdloan</a
        >:</label
      >

      <!-- Если нет аккаунтов в расширении -->
      <p v-if="accounts.length === 0" class="error">
        Connect your account to Polkadot.js extension
      </p>

      <p v-else :class="{ error: fields.account.error || notFound }">
        <select v-model="fields.account.value" class="container-full">
          <option
            v-for="(option, key) in accounts"
            :value="encodeAddress(option.address)"
            :key="key"
          >
            {{ nameAccount(option.meta.name, option.address) }}
          </option>
        </select>
        <span v-if="notFound"
          >This account was not participated in Robonomics Crowdloan 1st
          wave</span
        >
      </p>
    </section>

    <section
      :class="{
        disabled: fields.account.error || notFound || accounts.length === 0
      }"
    >
      <label>2. Your Ethereum account to receive NFT card:</label>
      <p :class="{ error: fields.eth_account.error }">
        <input
          type="text"
          v-model="fields.eth_account.value"
          class="container-full"
        />
        <span v-if="fields.eth_account.error">Check this address</span>
      </p>
    </section>
  </form>
</template>

<script>
import robonomicsVC from "robonomics-vc";
import { checkAddress, encodeAddress } from "@polkadot/util-crypto";
import { Robonomics } from "@/utils/robonomics-substrate";

export default {
  props: ["ethAddress", "notFound"],
  mixins: [robonomicsVC.mixins.form],
  data() {
    return {
      accounts: [],
      fields: {
        account: {
          value: "",
          type: "text",
          rules: [
            "require",
            robonomicsVC.validators.length(47),
            (v) => {
              return checkAddress(v, 2)[0];
            }
          ],
          error: false
        },
        eth_account: {
          value: "",
          type: "text",
          rules: [
            "require",
            (v) => {
              return this.$robonomics.web3.utils.isAddress(v);
            }
          ],
          error: false
        }
      }
    };
  },
  async created() {
    this.robonomics = Robonomics.getInstance("robonomics");
    this.robonomics.accountManager.onReady((e) => {
      if (e) {
        console.log(e.message);
        return;
      }
      this.accounts = this.robonomics.accountManager.getAccounts();
      this.fields.account.value = this.accounts.length
        ? this.encodeAddress(this.accounts[0].address)
        : "";
      this.robonomics.accountManager.onChange((account) => {
        this.fields.account.value = this.encodeAddress(account.address);
      });
    });
  },
  watch: {
    ethAddress: {
      immediate: true,
      handler() {
        this.fields.eth_account.value = this.ethAddress;
      }
    }
  },
  methods: {
    encodeAddress(v) {
      return encodeAddress(v, 2);
    },
    nameAccount(name, address) {
      const addr = this.encodeAddress(address);
      return `${name} - ${addr.substr(0, 5)}...${addr.substr(-5)}`;
    }
  }
};
</script>
