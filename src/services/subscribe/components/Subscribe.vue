<template>
  <fragment>
    <section>
      <div class="input-measured container-full">
        <input
          v-model="amount"
          type="text"
          placeholder
          class="container-full"
        />
        <span class="input-measure">RWS</span>
      </div>
      <hr />
      <XRT :value="amount" />
    </section>
  </fragment>
</template>

<script>
import XRT from "./XRT";

export default {
  components: { XRT },
  data() {
    return {
      amount: 1
    };
  }
};
</script>
