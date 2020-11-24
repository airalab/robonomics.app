<template>
  <div>
    <h2>How are you connecting to RWS IoT?</h2>
    <div>
      <p>
        Select the platform and SDK that best suits how you are connecting to
        RWS IoT.
      </p>
      <div class="block-wiz">
        <h3>Choose a platform</h3>
        <label>
          <input type="radio" name="platform" value="linux" checked />
          Linux
        </label>
      </div>
      <div class="block-wiz">
        <h3>Choose a RWS IoT Device SDK</h3>
        <label>
          <input type="radio" name="lang" value="node" checked />
          Node.js
        </label>
      </div>
      <div class="nav-wiz">
        <button @click="$emit('prev')">Prev</button>
        <button @click="next">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    next() {
      this.$emit("next", { platform: "linux", lang: "nodejs" });
    }
  }
};
</script>

<style scoped>
label {
  margin-right: 20px;
}
</style>
