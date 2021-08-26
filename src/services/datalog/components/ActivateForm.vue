<template>
  <form v-on:submit.prevent="submit">
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
  props: ["address"],
  mixins: [robonomicsVC.mixins.form],
  data() {
    return {
      fields: {
        account: {
          value: this.address,
          type: "text",
          rules: ["require", robonomicsVC.validators.length(48)],
          error: false
        }
      }
    };
  }
};
</script>
