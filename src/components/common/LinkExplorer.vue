<template>
  <fragment>
    <a :href="href" target="_blank" :class="classStyle" :title="text">
      <img v-if="type === 'chain'" :src="icon()" class="avatar-small align-vertical m-r-10" alt />
      {{ label }}
    </a>
    <a v-if="isCopy" @click="copy()" class="align-vertical" href="#">
      <i class="i-copy d-block"></i>
    </a>
  </fragment>
</template>

<script>
import makeBlockie from "ethereum-blockies-base64";
import * as filters from "../../utils/filters";

export default {
  props: {
    type: {
      type: String,
      default: "chain",
      validator: val => ["chain", "ipfs"].includes(val)
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
    },
    isCopy: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    href: function() {
      return this.type === "chain"
        ? filters.urlExplorer(this.text, this.category)
        : filters.urlIpfs(this.text, this.category);
    },
    label: function() {
      return this.isSlice
        ? this.text.slice(0, 6) + "..." + this.text.slice(-4)
        : this.text;
    }
  },
  methods: {
    icon() {
      return this.text ? makeBlockie(this.text) : "";
    },
    copy() {
      // clipboard.copy(this.text);
    }
  }
};
</script>
