<template>
  <div>
    <div v-for="(item, key) in paginatedData" :key="key">
      <slot v-bind:item="item" />
    </div>
    <button :disabled="pageNumber === 0" @click="prevPage">Previous</button>
    <button
      class="m-l-15"
      :disabled="pageNumber >= pageCount - 1"
      @click="nextPage"
    >
      Next
    </button>
  </div>
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
      let l = this.listData.length,
        s = this.size;
      return Math.ceil(l / s);
    },
    paginatedData() {
      const start = this.pageNumber * this.size,
        end = start + this.size;
      return this.listData.slice(start, end);
    }
  },
  methods: {
    nextPage() {
      this.pageNumber++;
      this.$emit("onPage", this.pageNumber);
    },
    prevPage() {
      this.pageNumber--;
      this.$emit("onPage", this.pageNumber);
    }
  }
};
</script>
