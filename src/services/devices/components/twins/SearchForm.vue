<template>
  <div>
    <form v-on:submit.prevent="submit">
      <RFormField>
        <RFieldLabel :isError="fields.addr.error">Address</RFieldLabel>
        <input
          type="text"
          v-model="fields.addr.value"
          class="input-size--md m-r-10 input-sm"
          :class="{ error: fields.addr.error }"
        />
        <button type="submit">Search</button>
      </RFormField>
    </form>
  </div>
</template>

<script>
import robonomicsVC from "robonomics-vc";
import { checkAddress } from "@polkadot/util-crypto";

export default {
  props: {
    addr: {
      default: ""
    }
  },
  mixins: [robonomicsVC.mixins.form],
  data() {
    return {
      fields: {
        addr: {
          value: this.addr,
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
  },
  created() {
    this.$on("onSubmit", this.handleSubmit);
  },
  methods: {
    handleSubmit(result) {
      if (!result.error) {
        this.$emit("addr", result.fields.addr.value);
      }
    }
  }
};
</script>
