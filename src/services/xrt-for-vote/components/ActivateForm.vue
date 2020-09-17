<template>
  <form v-on:submit.prevent="submit">
    <RFormField>
      <RFieldLabel :isError="fields.amount.error">Amount</RFieldLabel>
      <div class="input-measured container-full">
        <input
          v-model="fields.amount.value"
          type="text"
          placeholder
          class="container-full"
          :class="{ error: fields.amount.error }"
        />
        <span class="input-measure">VOTE</span>
      </div>
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
        }
      }
    };
  }
};
</script>
