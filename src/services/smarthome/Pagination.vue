<template>
  <template v-for="(item, key) in paginatedData" :key="key">
    <slot v-bind:item="item" v-bind:index="key" />
  </template>
  <slot name="pagination" v-bind="{ pageNumber, pageCount }" />
</template>

<script>
export default {
  props: {
    listData: {
      type: Array,
      required: true
    },
    currentPage: {
      type: Number,
      required: false,
      default: 0
    },
    size: {
      type: Number,
      required: false,
      default: 1
    }
  },
  data() {
    return {
      pageNumber: this.currentPage
    };
  },
  watch: {
    currentPage: function (newVal) {
      this.pageNumber = newVal;
    }
  },
  computed: {
    pageCount() {
      let l = this.listData.length;
      let s = this.size;
      return Math.ceil(l / s);
    },
    paginatedData() {
      const start = this.pageNumber * this.size;
      const end = start + this.size;
      return this.listData.slice(start, end);
    }
  }
};
</script>
