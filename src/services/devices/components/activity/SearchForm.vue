<template>
  <div>
    <form v-on:submit.prevent="submit">
      <RFormField>
        <RFieldLabel :isError="fields.addr.error">Thing name</RFieldLabel>
        <input
          type="text"
          v-model="fields.addr.value"
          class="scontainer-full"
          :class="{ error: fields.addr.error }"
        />
        <button type="submit">Search</button>
      </RFormField>
    </form>
  </div>
</template>

<script>
import robonomicsVC from "robonomics-vc";

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
          rules: ["require"],
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
