<template>
  <Overlay>
    <Error :title="title">
      <slot>
        <p>Try to refresh browser page.</p>
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
      default: "Not found account"
    }
  },
  components: {
    Overlay,
    Error
  }
};
</script>
