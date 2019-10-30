<template>
  <Overlay>
    <Error :title="title">
      <slot>
        <p v-if="isRequest">
          Try to refresh browser page or
          <button @click="requestAccount">request account</button>.
        </p>
        <p v-else>Try to refresh browser page.</p>
      </slot>
    </Error>
  </Overlay>
</template>

<script>
import Overlay from "../Overlay";
import Error from "./Error";

export default {
  props: {
    title: {
      type: String,
      default: "No access to account"
    },
    isRequest: {
      type: Boolean,
      default: true
    }
  },
  components: {
    Overlay,
    Error
  },
  methods: {
    requestAccount() {
      this.$emit("requestAccount");
      // Web3Check.access();
    }
  }
};
</script>
