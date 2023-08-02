<template>
  <robo-layout>
    <dapp-header :title="props.title" />
    <slot />
  </robo-layout>
</template>

<script setup>
import DappHeader from "@/components/Header";
import { defineProps } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Robonomics Dapp"
  }
});
</script>
