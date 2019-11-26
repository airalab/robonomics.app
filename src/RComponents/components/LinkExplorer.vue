<template>
  <a :href="href" target="_blank" :class="classStyle" :title="text">
    <Avatar
      v-if="type === 'chain'"
      :address="text"
      class="avatar-small align-vertical m-r-10"
    />
    <b>{{ label }}</b>
  </a>
</template>

<script>
import Avatar from "./Avatar";
import * as filters from "../tools/filters";

export default {
  components: {
    Avatar
  },
  props: {
    type: {
      type: String,
      default: "chain",
      validator: val => ["chain", "ipfs"].includes(val)
    },
    chainid: {
      type: Number,
      default: 1
    },
    text: {
      type: String
    },
    category: {
      type: String,
      default: ""
    },
    classStyle: {
      type: String,
      default: "align-vertical m-r-10"
    },
    isSlice: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    href: function() {
      return this.type === "chain"
        ? filters.urlExplorer(this.text, this.category, this.chainid)
        : filters.urlIpfs(this.text, this.category);
    },
    label: function() {
      return this.isSlice
        ? this.text.slice(0, 6) + "..." + this.text.slice(-4)
        : this.text;
    }
  }
};
</script>
