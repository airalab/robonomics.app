<template>
  <form v-on:submit.prevent="submit">
    <section>
      <label>Owner nft card pioneer:</label>
      <p :class="{ error: fields.signer.error }">
        <template v-if="$robonomics.account">
          <input
            type="text"
            v-model="fields.signer.value"
            disabled
            class="container-full"
            :class="{ error: fields.signer.error }"
          />
        </template>
        <button v-else @click.stop="$web3.initAccount()" class="btn-outline">
          Connect your Ethereum account
        </button>
      </p>
    </section>
    <section :class="{ disabled: fields.address.error }">
      <label>Kusama Crowdloan contributor:</label>
      <p v-if="accounts.length === 0" class="error">
        Connect your account to Polkadot.js extension
      </p>
      <template v-else>
        <p :class="{ error: fields.address.error }">
          <select v-model="fields.address.value" class="container-full">
            <option
              v-for="(option, key) in accounts"
              :value="option.address"
              :key="key"
            >
              {{ option.meta.name }}
            </option>
          </select>
        </p>
        <input
          type="text"
          :value="addr"
          class="container-full"
          placeholder="Account address (contributor)"
          :class="{ error: fields.address.error }"
          disabled
        />
      </template>
    </section>
  </form>
</template>

<script>
import robonomicsVC from "robonomics-vc";
import { checkAddress, encodeAddress } from "@polkadot/util-crypto";
import { Robonomics } from "@/utils/robonomics-substrate";

export default {
  mixins: [robonomicsVC.mixins.form],
  data() {
    return {
      accounts: [],
      fields: {
        address: {
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
        },
        signer: {
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
    if (this.$robonomics.account) {
      this.fields.signer.value = this.$robonomics.account.address;
    }
    this.robonomics = Robonomics.getInstance("robonomics");
    this.robonomics.accountManager.onReady((e) => {
      if (e) {
        console.log(e.message);
        return;
      }
      this.accounts = this.robonomics.accountManager.getAccounts();
      this.fields.address.value = this.accounts.length
        ? this.accounts[0].address
        : "";
      this.robonomics.accountManager.onChange((account) => {
        this.fields.address.value = account.address;
      });
    });
  },
  computed: {
    addr() {
      return encodeAddress(this.fields.address.value, 2);
    }
  }
};
</script>
