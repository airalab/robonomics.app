<template>
  <div class="panel">
    <select v-model="type">
      <option value="pm10">PM10</option>
      <option value="pm25">PM2.5</option>
    </select>
  </div>
</template>

<script>
export default {
  props: ["current"],
  data() {
    return {
      type: this.current
    };
  },
  watch: {
    type: function () {
      this.$router.push({
        name: "sensors-map",
        params: {
          provider: this.$route.params.provider || "ipfs",
          type: this.type,
          zoom: this.$route.params.zoom,
          lat: this.$route.params.lat,
          lng: this.$route.params.lng
        }
      });
      window.location.reload(false);
    }
  }
};
</script>

<style scoped>
.panel {
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 85px;
  z-index: 10000000;
  background: rgba(255, 255, 255, 0.7);
  padding: 10px;
  border: 5px solid #e0e0e0;
}
/* select {
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #a2a2a2;
  border-radius: 2px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
} */
</style>
