<template>
  <div class="section-light window">
    <div class="window-head" :class="classHead">
      <slot name="header" />
      <a class="window-head-toggle" href="javascript:;" @click="toggle">{{
        icon
      }}</a>
    </div>
    <div class="window-content" v-show="isShow">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: ["id", "classHead"],
  data() {
    return {
      isShow: null
    };
  },
  computed: {
    icon: function() {
      return this.isShow ? "–" : "+";
    }
  },
  created() {
    if (this.id) {
      const windows = this.store();
      this.isShow = windows[this.id] === undefined ? true : windows[this.id];
    }
  },
  methods: {
    toggle() {
      this.isShow = !this.isShow;
      if (this.id) {
        const windows = this.store();
        windows[this.id] = this.isShow;
        localStorage.setItem("windows", JSON.stringify(windows));
      }
    },
    store() {
      let windows = localStorage.getItem("windows");
      if (windows) {
        windows = JSON.parse(windows);
      } else {
        windows = {};
      }
      return windows;
    }
  }
};
</script>
