<template>
  <form v-on:submit.prevent="submit">
    <RFormField>
      <RFieldLabel :isError="fields.account.error">
        Parachain Account (Use
        <a href="https://parachain.robonomics.network/" target="_blank">
          Substrate portal
        </a>
        to create)
      </RFieldLabel>
      <input
        type="text"
        v-model="fields.account.value"
        class="container-full"
        :class="{ error: fields.account.error }"
      />
    </RFormField>
  </form>
</template>

<script>
import robonomicsVC from "robonomics-vc";
import { checkAddress } from "@polkadot/util-crypto";

export default {
  mixins: [robonomicsVC.mixins.form],
  data() {
    return {
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
        }
      }
    };
  }
};
</script>
