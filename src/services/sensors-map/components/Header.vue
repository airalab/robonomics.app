<template>
  <div class="header">
    <div class="header-content">
      <HeaderTitle v-if="title" />
      <HeaderMarquee v-else :points="points" />
    </div>
    <div class="nav">
      <a
        href="https://wiki.robonomics.network/docs/iot-sensors-connectivity/"
        target="_blank"
        >How to connect</a
      >&nbsp;
      <a
        href="https://github.com/airalab/sensors.robonomics.network"
        target="_blank"
        >Fork me</a
      >
      <button @click="toggle" :disabled="Object.keys(points).length === 0">
        <template v-if="title">data ticker</template>
        <template v-else>toggle</template>
      </button>
    </div>
  </div>
</template>

<script>
import HeaderTitle from "./HeaderTitle.vue";
import HeaderMarquee from "./HeaderMarquee.vue";

export default {
  props: ["points"],
  components: { HeaderTitle, HeaderMarquee },
  data() {
    return {
      title: true
    };
  },
  methods: {
    toggle() {
      this.title = !this.title;
    }
  }
};
</script>

<style scoped>
.header {
  overflow: hidden;
  white-space: nowrap;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  border: 5px solid #e0e0e0;
  height: 34px;
  width: 100%;
  padding: 5px;
  font-size: 12px;
  display: flex;
}
.header-content {
  flex: 1 1 auto;
}
.header .nav {
  margin: 2px 0px 0 10px;
}
.header a {
  color: #5343ff;
  text-decoration: underline;
  margin-right: 10px;
}
.header button {
  padding: 2px 10px;
  margin: -2px 5px 0;
  font-size: 10px;
  cursor: pointer;
  /* background-color: #fff;
  border: 1px solid #a2a2a2;
  border-radius: 2px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2); */
}
.header button:hover {
  background-color: #eee;
}
.header button:focus {
  outline: 0;
}
.header button:disabled {
  cursor: not-allowed;
}
</style>
