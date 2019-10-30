<template>
  <Overlay>
    <Error :title="title">
      <slot>
        <p>
          <b>For work, you need to switch the network.</b>
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
      default: "Dapp only works on the main network and sidechain"
    }
  },
  components: {
    Overlay,
    Error
  }
};
</script>
