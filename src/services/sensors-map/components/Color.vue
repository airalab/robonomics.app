<template>
  <div class="panel">
    <div
      style="height: 200px; width: 25px; float: left;"
      :style="{ background: `linear-gradient(0deg,${grad})` }"
    ></div>
    <div
      style="
        height: 188px;
        width: 27px;
        float: left;
        position: relative;
        margin-left: 7px;
        font-size: 12px;
        margin-top: 12px;
      "
    >
      <div style="position: absolute; bottom: 100%;">500</div>
      <div style="position: absolute; bottom: 80%;">100</div>
      <div style="position: absolute; bottom: 60%;">75</div>
      <div style="position: absolute; bottom: 40%;">50</div>
      <div style="position: absolute; bottom: 20%;">25</div>
      <div style="position: absolute; bottom: 0%;">0</div>
    </div>
  </div>
</template>

<script>
import generate, { getGradient } from "../utils/color";

export default {
  data() {
    return {
      grad: "",
    };
  },
  mounted() {
    const scaleGrad = generate([
      "#00796b",
      "#00796b",
      "#f9a825",
      "#e65100",
      "#dd2c00",
      "#dd2c00",
      "#8c0084",
    ]);
    this.grad = getGradient(scaleGrad, 7);
  },
};
</script>

<style scoped>
.panel {
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10000000;
  background: rgba(255, 255, 255, 0.7);
  padding: 10px;
  border: 5px solid #e0e0e0;
}
</style>
