<template>
  <form v-on:submit.prevent="submit">
    <RFormField>
      <RFieldLabel :isError="fields.amount.error">amount</RFieldLabel>
      <div class="input-measured container-full">
        <input
          v-model="fields.amount.value"
          type="text"
          placeholder
          class="container-full"
          :class="{ error: fields.amount.error }"
        />
        <span class="input-measure">RWS</span>
      </div>
      <small>1 RWS token = 1.0 tps</small>
    </RFormField>
    <RFormField>
      <RFieldLabel :isError="fields.account.error">account</RFieldLabel>
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

export default {
  mixins: [robonomicsVC.mixins.form],
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
          rules: ["require", robonomicsVC.validators.length(48)],
          error: false
        }
      }
    };
  }
};
</script>
