<template>
  <Overlay>
    <section>
      <div class="loader">
        <div class="loader-ring align-vertical m-r-15"></div>
        <b class="align-vertical t-style_uppercase">
          <slot>Loading</slot>
        </b>
      </div>
    </section>
  </Overlay>
</template>

<script>
import Overlay from "./Overlay";

export default {
  components: {
    Overlay
  }
};
</script>
