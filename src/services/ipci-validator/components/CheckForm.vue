<template>
  <form v-on:submit.prevent="submit" style="text-align: left">
    <RFormField>
      <RFieldLabel :isError="fields.account.error">
        Parachain Account
      </RFieldLabel>
      <select v-model="fields.account.value" class="container-full">
        <option
          v-for="(option, key) in accounts"
          :value="option.address"
          :key="key"
        >
          {{ option.meta.name }}
        </option>
      </select>
      <input
        type="text"
        v-model="fields.account.value"
        class="container-full"
        placeholder="Validator account address (STASH)"
        :class="{ error: fields.account.error }"
        disabled
      />
    </RFormField>

    <RFormField>
      <RFieldLabel :isError="fields.eth_account.error">
        Eth Account
      </RFieldLabel>
      <input
        type="text"
        v-model="fields.eth_account.value"
        class="container-full"
        :class="{ error: fields.eth_account.error }"
      />
    </RFormField>
  </form>
</template>

<script>
import robonomicsVC from "robonomics-vc";
import { checkAddress } from "@polkadot/util-crypto";
import { Robonomics } from "@/utils/robonomics-substrate";

export default {
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
            robonomicsVC.validators.length(48),
            (v) => {
              return checkAddress(v, 32)[0];
            }
          ],
          error: false
        },
        eth_account: {
          value: "",
          type: "text",
          rules: ["require"],
          error: false
        }
      }
    };
  },
  async created() {
    this.robonomics = Robonomics.getInstance("ipci");
    if (this.robonomics) {
      this.accounts = this.robonomics.accountManager.getAccounts();
      this.fields.account.value = this.accounts.length
        ? this.accounts[0].address
        : "";
    }
  }
};
</script>
