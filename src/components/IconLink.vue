<template>
  <fragment>
    <a v-if="text" :href="href" target="_blank" class="align-vertical m-r-10">
      <img v-if="isIcon" :src="icon()" class="avatar-small align-vertical m-r-10" alt />
      <b>{{ text.slice(0, 6) + '...' + text.slice(-4) }}</b>
    </a>
    <a v-if="isCopy" @click="copy()" class="align-vertical" href="#">
      <i class="i-copy d-block"></i>
    </a>
  </fragment>
</template>

<script>
import makeBlockie from "ethereum-blockies-base64";

export default {
  props: {
    href: {
      type: String
    },
    text: {
      type: String
    },
    isIcon: {
      type: Boolean,
      default: true
    },
    isCopy: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    icon() {
      return makeBlockie(this.text);
    },
    copy() {
      // clipboard.copy(this.text);
    }
  }
};
</script>
