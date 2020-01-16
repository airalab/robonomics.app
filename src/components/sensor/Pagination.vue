<template>
  <div>
    <div v-for="(item, key) in paginatedData" :key="key">
      <slot v-bind:item="item" />
    </div>
    <button :disabled="pageNumber === 0" @click="prevPage">Previous</button>
    <button :disabled="pageNumber >= pageCount -1" @click="nextPage">Next</button>
  </div>
</template>

<script>
export default {
  props: {
    listData: {
      type: Array,
      required: true
    },
    size: {
      type: Number,
      required: false,
      default: 1
    }
  },
  data() {
    return {
      pageNumber: 0
    };
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
    },
    prevPage() {
      this.pageNumber--;
    }
  }
};
</script>
