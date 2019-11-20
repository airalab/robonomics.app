<template>
  <Overlay>
    <Error :title="title">
      <slot>
        <p>
          <b>
            Please, setup:
            <a
              class="t-style_uppercase"
              href="https://metamask.io/"
              target="_blank"
              >Metamask</a
            >
          </b>
        </p>
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
      default: "Plugin required for application operation"
    }
  },
  components: {
    Overlay,
    Error
  }
};
</script>
